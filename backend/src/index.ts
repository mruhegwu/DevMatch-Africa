import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import tasksRoutes from './routes/tasks';
import applyRoutes from './routes/apply';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// CORS: allow requests from the Next.js frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Required for cookies/sessions
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware — stores user login state server-side
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'devmatch-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    },
  })
);

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/tasks', tasksRoutes);
app.use('/apply', applyRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 DevMatch Africa API running on http://localhost:${PORT}`);
});

export default app;
