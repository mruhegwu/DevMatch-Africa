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
