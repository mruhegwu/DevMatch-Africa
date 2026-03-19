import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { fetchGitHubProfile } from '../services/githubService';
import { calculateSkillScore } from '../services/scoringService';
import { generateAIProfile } from '../services/openaiService';

const router = Router();

// GET /user/profile — Return the logged-in user's full profile
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  const userId = (req.session as { userId?: string }).userId!;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        repositories: {
          orderBy: { stars: 'desc' },
          take: 10,
        },
        applications: {
          include: { task: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /user/repos — Return the logged-in user's repositories
router.get('/repos', requireAuth, async (req: Request, res: Response) => {
  const userId = (req.session as { userId?: string }).userId!;

  try {
    const repos = await prisma.repository.findMany({
      where: { userId },
      orderBy: { stars: 'desc' },
    });
    return res.json(repos);
  } catch (error) {
    console.error('Repos fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// POST /user/refresh — Re-analyze GitHub profile and update score/bio
router.post('/refresh', requireAuth, async (req: Request, res: Response) => {
  const userId = (req.session as { userId?: string }).userId!;

  // Require GitHub access token to be passed from the client
  const { accessToken } = req.body as { accessToken?: string };
  if (!accessToken) {
    return res.status(400).json({ error: 'GitHub access token required' });
  }

  try {
    const githubProfile = await fetchGitHubProfile(accessToken);
    const skillData = calculateSkillScore(
      githubProfile.repos,
      githubProfile.languages,
      githubProfile.followers
    );

    const aiProfile = await generateAIProfile(
      githubProfile.login,
      githubProfile.repos,
      githubProfile.languages,
      skillData.score
    );

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        bio: aiProfile.bio,
        skillScore: skillData.score,
        skillLevel: skillData.level,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error('Profile refresh error:', error);
    return res.status(500).json({ error: 'Failed to refresh profile' });
  }
});

export default router;
