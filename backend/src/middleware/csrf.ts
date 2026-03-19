import { Request, Response, NextFunction } from 'express';

// Simple CSRF protection via Origin / Referer header validation.
// This guards against cross-site request forgery for state-changing endpoints
// when the app uses session cookies.
//
// For a REST API consumed by a dedicated frontend we verify that non-GET
// requests originate from the known frontend origin.  Legitimate browser
// requests always send the Origin (or, as a fallback, the Referer) header.

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Only validate state-changing methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  // The OAuth callback is GET — not covered by this middleware — but we allow
  // POST /auth/logout from the frontend without a body origin check because
  // it uses the Origin header which is validated below.

  const allowedOrigin = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

  const origin = req.headers['origin'];
  const referer = req.headers['referer'];

  // Prefer the Origin header; fall back to Referer
  const requestOrigin = origin ?? (referer ? new URL(referer).origin : null);

  if (!requestOrigin || requestOrigin !== allowedOrigin) {
    res.status(403).json({ error: 'CSRF validation failed: invalid origin.' });
    return;
  }

  next();
}
