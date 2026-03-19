import { Router, Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../lib/prisma';
import { fetchGitHubProfile } from '../services/githubService';
import { calculateSkillScore } from '../services/scoringService';
import { generateAIProfile } from '../services/openaiService';
import { getSessionCsrfToken } from '../middleware/csrf';

const router = Router();

// Step 1: Redirect user to GitHub OAuth authorization page
router.get('/github', (_req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_CALLBACK_URL!,
    scope: 'read:user user:email public_repo',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// Step 2: GitHub calls back with a code — exchange it for an access token
router.get('/github/callback', async (req: Request, res: Response) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (!code) {
    return res.redirect(`${frontendUrl}/login?error=no_code`);
  }

  try {
    // Exchange code for GitHub access token
    const tokenRes = await axios.post<{
      access_token: string;
      token_type: string;
    }>(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      return res.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
    }

    // Fetch GitHub profile and repos
    const githubProfile = await fetchGitHubProfile(accessToken);

    // Calculate skill score
    const skillData = calculateSkillScore(
      githubProfile.repos,
      githubProfile.languages,
      githubProfile.followers
    );

    // Generate AI bio (runs in background — don't block the login)
    let bio = `Developer with ${githubProfile.publicRepos} public repositories.`;
    try {
      const aiProfile = await generateAIProfile(
        githubProfile.login,
        githubProfile.repos,
        githubProfile.languages,
        skillData.score
      );
      bio = aiProfile.bio;
    } catch {
      // Non-critical — use fallback bio
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { githubId: String(githubProfile.login) },
      update: {
        username: githubProfile.login,
        avatar: githubProfile.avatar,
        email: githubProfile.email,
        bio,
        skillScore: skillData.score,
        skillLevel: skillData.level,
      },
      create: {
        githubId: githubProfile.login,
        username: githubProfile.login,
        avatar: githubProfile.avatar,
        email: githubProfile.email,
        bio,
        skillScore: skillData.score,
        skillLevel: skillData.level,
      },
    });

    // Sync top repositories to DB (upsert-style: delete and recreate)
    await prisma.repository.deleteMany({ where: { userId: user.id } });
    if (githubProfile.repos.length > 0) {
      await prisma.repository.createMany({
        data: githubProfile.repos.slice(0, 20).map((repo) => ({
          name: repo.name,
          stars: repo.stars,
          language: repo.language,
          url: repo.url,
          userId: user.id,
        })),
      });
    }

    // Store user ID in session
    (req.session as { userId?: string }).userId = user.id;

    // Redirect to frontend dashboard
    return res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});

// Logout — destroy session
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully' });
  });
});

// Check authentication status
router.get('/me', (req: Request, res: Response) => {
  const userId = (req.session as { userId?: string }).userId;
  if (userId) {
    res.json({ authenticated: true, userId });
  } else {
    res.json({ authenticated: false });
  }
});

// GET /auth/csrf-token — returns the CSRF token for this session.
// The frontend must call this before making any state-changing request and
// include the token in subsequent requests via the X-CSRF-Token header.
router.get('/csrf-token', (req: Request, res: Response) => {
  const token = getSessionCsrfToken(req);
  res.json({ csrfToken: token });
});

export default router;
