import { Request, Response, NextFunction } from 'express';

// Middleware to verify that the user is authenticated via session
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session && (req.session as { userId?: string }).userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Please log in with GitHub.' });
  }
}
