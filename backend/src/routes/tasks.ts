import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /tasks — List all available tasks (with optional skill filter)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { skill } = req.query;
  const userId = (req.session as { userId?: string }).userId!;

  try {
    // Fetch all tasks
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Fetch the user's existing applications to mark applied tasks
    const userApplications = await prisma.application.findMany({
      where: { userId },
      select: { taskId: true, status: true },
    });

    const appliedTaskIds = new Set(userApplications.map((a) => a.taskId));

    // Filter by skill if provided
    const filteredTasks = skill
      ? tasks.filter((t) =>
          t.skillsRequired.some((s) =>
            s.toLowerCase().includes((skill as string).toLowerCase())
          )
        )
      : tasks;

    // Attach application status to each task
    const tasksWithStatus = filteredTasks.map((task) => ({
      ...task,
      applied: appliedTaskIds.has(task.id),
      applicationStatus: userApplications.find((a) => a.taskId === task.id)?.status || null,
    }));

    return res.json(tasksWithStatus);
  } catch (error) {
    console.error('Tasks fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /tasks/recommended — AI job matching: return tasks ranked by overlap
// with the logged-in developer's languages and skill level.
// Must be defined BEFORE /:id to avoid "recommended" being treated as an ID.
router.get('/recommended', requireAuth, async (req: Request, res: Response) => {
  const userId = (req.session as { userId?: string }).userId!;

  try {
    // Fetch user's profile (skill score + repositories for language extraction)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        skillScore: true,
        skillLevel: true,
        repositories: { select: { language: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Derive the developer's unique languages
    const userLanguages = [
      ...new Set(
        user.repositories
          .filter((r) => r.language)
          .map((r) => (r.language as string).toLowerCase())
      ),
    ];

    // Fetch all tasks
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Fetch the user's existing applications
    const userApplications = await prisma.application.findMany({
      where: { userId },
      select: { taskId: true, status: true },
    });
    const appliedTaskIds = new Set(userApplications.map((a) => a.taskId));

    // Score each task by language overlap with the developer's skills.
    // Each matched required skill adds 1 point.  Tasks the user already
    // applied to are deprioritised (sent to the end).
    const scored = tasks.map((task) => {
      const matchCount = task.skillsRequired.filter((s) =>
        userLanguages.includes(s.toLowerCase())
      ).length;
      return {
        ...task,
        applied: appliedTaskIds.has(task.id),
        applicationStatus:
          userApplications.find((a) => a.taskId === task.id)?.status || null,
        _matchScore: matchCount,
      };
    });

    // Sort: most matching skills first; already-applied tasks last
    scored.sort((a, b) => {
      if (a.applied !== b.applied) return a.applied ? 1 : -1;
      return b._matchScore - a._matchScore;
    });

    // Strip the internal _matchScore before returning
    const result = scored.map(({ _matchScore: _, ...task }) => task);

    return res.json(result.slice(0, 6)); // top 6 recommended
  } catch (error) {
    console.error('Recommended tasks error:', error);
    return res.status(500).json({ error: 'Failed to fetch recommended tasks' });
  }
});

// POST /tasks — Create a new task (admin-protected via ADMIN_SECRET header)
router.post('/', async (req: Request, res: Response) => {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers['x-admin-secret'];

  // Require a non-empty ADMIN_SECRET to be set in env and matched
  if (!adminSecret || providedSecret !== adminSecret) {
    return res.status(403).json({ error: 'Forbidden: invalid admin secret' });
  }

  const { title, description, budget, skillsRequired } = req.body as {
    title?: string;
    description?: string;
    budget?: number;
    skillsRequired?: string[];
  };

  if (!title || !description || budget === undefined || !Array.isArray(skillsRequired)) {
    return res.status(400).json({
      error: 'title, description, budget, and skillsRequired (array) are required',
    });
  }

  if (typeof budget !== 'number' || budget < 0) {
    return res.status(400).json({ error: 'budget must be a non-negative number' });
  }

  try {
    const task = await prisma.task.create({
      data: { title, description, budget, skillsRequired },
    });
    return res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// GET /tasks/:id — Get a single task by ID
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.json(task);
  } catch (error) {
    console.error('Task fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch task' });
  }
});

export default router;
