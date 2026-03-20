import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /apply — Apply to a task
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const userId = (req.session as { userId?: string }).userId!;
  const { taskId } = req.body as { taskId?: string };

  if (!taskId) {
    return res.status(400).json({ error: 'taskId is required' });
  }

  try {
    // Check task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Create application (unique constraint prevents duplicates)
    const application = await prisma.application.create({
      data: { userId, taskId, status: 'pending' },
      include: { task: true },
    });

    return res.status(201).json(application);
  } catch (error: unknown) {
    // Handle duplicate application (Prisma unique constraint violation)
    if (
      error instanceof Error &&
      'code' in (error as { code?: string }) &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return res.status(409).json({ error: 'You have already applied to this task' });
    }
    console.error('Apply error:', error);
    return res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET /apply — List the logged-in user's applications
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = (req.session as { userId?: string }).userId!;

  try {
    const applications = await prisma.application.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(applications);
  } catch (error) {
    console.error('Applications fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// DELETE /apply/:id — Withdraw an application
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const userId = (req.session as { userId?: string }).userId!;
  const { id } = req.params;

  try {
    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    if (application.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.application.delete({ where: { id } });
    return res.json({ message: 'Application withdrawn' });
  } catch (error) {
    console.error('Delete application error:', error);
    return res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

// PATCH /apply/:id — Update application status (admin-protected)
// Allows admins to accept or reject an application.
router.patch('/:id', async (req: Request, res: Response) => {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers['x-admin-secret'];

  if (!adminSecret || providedSecret !== adminSecret) {
    return res.status(403).json({ error: 'Forbidden: invalid admin secret' });
  }

  const { id } = req.params;
  const { status } = req.body as { status?: string };

  const validStatuses = ['pending', 'accepted', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${validStatuses.join(', ')}`,
    });
  }

  try {
    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
      include: { task: true, user: { select: { id: true, username: true } } },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update application error:', error);
    return res.status(500).json({ error: 'Failed to update application status' });
  }
});

export default router;
