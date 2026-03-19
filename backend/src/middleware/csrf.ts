import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF protection using the Synchronizer Token Pattern.
//
// A secret CSRF token is generated and stored in the user's session on first
// request.  For every state-changing HTTP method (POST/PUT/PATCH/DELETE) the
// server validates that the client included the same token as a request header
// (X-CSRF-Token).  Because the Same-Origin Policy prevents attacker-controlled
// pages from reading the token, cross-site request forgery is blocked.
//
// The frontend must:
//   1. Call GET /auth/csrf-token to obtain the current token.
//   2. Include the token in every mutating request header: X-CSRF-Token: <token>.

const CSRF_TOKEN_LENGTH = 32; // bytes → 64 hex chars

/** Return (or lazily create) the CSRF token stored in the session. */
export function getSessionCsrfToken(req: Request): string {
  const sess = req.session as { csrfToken?: string };
  if (!sess.csrfToken) {
    sess.csrfToken = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  }
  return sess.csrfToken;
}

/** Middleware that enforces CSRF token validation on mutating requests. */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  // Read the expected token from the session (creates one if missing)
  const expectedToken = getSessionCsrfToken(req);

  // The client must send the token via X-CSRF-Token header
  const providedToken = req.headers['x-csrf-token'];

  if (
    !providedToken ||
    typeof providedToken !== 'string' ||
    !crypto.timingSafeEqual(
      Buffer.from(providedToken),
      Buffer.from(expectedToken)
    )
  ) {
    res.status(403).json({ error: 'CSRF token validation failed.' });
    return;
  }

  next();
}

