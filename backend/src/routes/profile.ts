import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /profile/:username — Public developer portfolio (no auth required)
// This is the shareable portfolio link for each developer.
router.get('/:username', async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        // Never expose githubId or internal IDs to public
        id: true,
        username: true,
        avatar: true,
        bio: true,
        skillScore: true,
        skillLevel: true,
        createdAt: true,
        repositories: {
          orderBy: { stars: 'desc' },
          take: 12,
          select: {
            id: true,
            name: true,
            stars: true,
            language: true,
            url: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    // Derive top languages from repositories
    const languages = [
      ...new Set(
        user.repositories
          .filter((r) => r.language)
          .map((r) => r.language as string)
      ),
    ];

    const totalStars = user.repositories.reduce((sum, r) => sum + r.stars, 0);

    return res.json({ ...user, languages, totalStars });
  } catch (error) {
    console.error('Public profile fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
