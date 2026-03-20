# DevMatch Africa 🌍

> **AI-powered platform that converts GitHub profiles into verified developer portfolios and matches developers to paid tasks.**

[![Made for Africa](https://img.shields.io/badge/Made%20for-Africa-green?style=flat-square)](https://github.com/mruhegwu/DevMatch-Africa)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://prisma.io)

---

## 🎯 Overview

DevMatch Africa is a production-ready MVP that:

1. **Allows developers to sign in with GitHub** — frictionless OAuth authentication
2. **Analyzes their repositories** — fetches repos, languages, stars, and activity
3. **Generates an AI-powered developer profile** — uses OpenAI to write a professional bio and skills summary
4. **Assigns a skill score (0–100)** — based on repos, stars, languages, and activity
5. **Displays available tasks** — a marketplace of paid developer tasks
6. **Allows developers to apply for tasks** — one-click applications stored in the database

---

## 🧱 Tech Stack

| Layer      | Technology                             |
|------------|----------------------------------------|
| Frontend   | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend    | Node.js, Express.js, TypeScript        |
| Database   | PostgreSQL via Prisma ORM              |
| Auth       | GitHub OAuth (custom implementation)   |
| AI         | OpenAI API (gpt-3.5-turbo)            |

---

## 📁 Project Structure

```
DevMatch-Africa/
├── backend/                 # Express.js API
│   ├── prisma/
│   │   ├── schema.prisma    # Database models
│   │   └── seed.ts          # Sample tasks seeder
│   ├── src/
│   │   ├── index.ts         # App entry point
│   │   ├── lib/
│   │   │   └── prisma.ts    # Prisma singleton client
│   │   ├── middleware/
│   │   │   └── auth.ts      # Session auth middleware
│   │   ├── routes/
│   │   │   ├── auth.ts      # /auth/github, /auth/github/callback, /auth/logout
│   │   │   ├── user.ts      # /user/profile, /user/repos
│   │   │   ├── tasks.ts     # /tasks
│   │   │   └── apply.ts     # /apply
│   │   └── services/
│   │       ├── githubService.ts   # GitHub API fetcher
│   │       ├── openaiService.ts   # AI profile generator
│   │       └── scoringService.ts  # Skill scoring algorithm
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── login/page.tsx   # Login page
│   │   │   ├── dashboard/page.tsx  # Developer dashboard
│   │   │   └── tasks/page.tsx   # Task marketplace
│   │   ├── components/
│   │   │   ├── ui/              # Base UI components (ShadCN-style)
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── RepoCard.tsx
│   │   └── lib/
│   │       ├── api.ts           # API client (Axios)
│   │       └── utils.ts         # Tailwind merge utility
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema

```prisma
model User {
  id           String    // CUID
  githubId     String    @unique
  username     String    @unique
  avatar       String?
  email        String?
  bio          String?   // AI-generated
  skillScore   Int       // 0–100
  skillLevel   String    // Beginner | Intermediate | Advanced
  repositories Repository[]
  applications Application[]
}

model Repository {
  id       String
  name     String
  stars    Int
  language String?
  url      String?
  user     User
}

model Task {
  id             String
  title          String
  description    String
  budget         Float
  skillsRequired String[]
  applications   Application[]
}

model Application {
  id     String
  status String  // pending | accepted | rejected
  user   User
  task   Task
  @@unique([userId, taskId])  // Prevents duplicate applications
}
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- GitHub OAuth App ([create one here](https://github.com/settings/developers))
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

---

### 1. Clone & Install

```bash
git clone https://github.com/mruhegwu/DevMatch-Africa.git
cd DevMatch-Africa

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/devmatch_africa"
SESSION_SECRET=your-very-long-random-secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:3000
ADMIN_SECRET=your-admin-secret-key
PORT=4000
```

**Frontend** (`frontend/.env.local`):
```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

### 3. Set Up the Database

```bash
cd backend

# Run Prisma migrations (creates tables)
npx prisma migrate dev --name init

# Seed with sample tasks
npx ts-node prisma/seed.ts

# (Optional) Open Prisma Studio to browse the database
npx prisma studio
```

---

### 4. Configure GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: DevMatch Africa
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:4000/auth/github/callback`
4. Copy the **Client ID** and **Client Secret** to `backend/.env`

---

### 5. Start the Application

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 API Endpoints

| Method | Endpoint                | Auth Required | Description                          |
|--------|-------------------------|---------------|--------------------------------------|
| GET    | `/auth/github`          | No            | Redirect to GitHub OAuth             |
| GET    | `/auth/github/callback` | No            | OAuth callback — creates/updates user |
| POST   | `/auth/logout`          | No            | Destroy session                      |
| GET    | `/auth/me`              | No            | Check auth status                    |
| GET    | `/auth/csrf-token`      | No            | Get CSRF token for mutating requests |
| GET    | `/user/profile`         | ✅            | Get full user profile with repos     |
| GET    | `/user/repos`           | ✅            | Get user repositories                |
| GET    | `/tasks`                | ✅            | List all tasks (filter by `?skill=`) |
| GET    | `/tasks/recommended`    | ✅            | AI-matched tasks for the logged-in developer |
| GET    | `/tasks/:id`            | ✅            | Get single task                      |
| POST   | `/tasks`                | Admin secret  | Create a new task (`X-Admin-Secret` header) |
| POST   | `/apply`                | ✅            | Apply to a task (`{ taskId }`)       |
| GET    | `/apply`                | ✅            | List user's applications             |
| DELETE | `/apply/:id`            | ✅            | Withdraw a pending application       |
| PATCH  | `/apply/:id`            | Admin secret  | Update application status (`X-Admin-Secret` header) |
| GET    | `/profile/:username`    | No            | Public developer portfolio (shareable) |
| GET    | `/health`               | No            | Health check                         |

### Creating Tasks (Admin)

```bash
curl -X POST http://localhost:4000/tasks \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: your-admin-secret-key" \
  -d '{
    "title": "Build a React landing page",
    "description": "Create a responsive landing page for our startup.",
    "budget": 400,
    "skillsRequired": ["React", "TypeScript", "CSS"]
  }'
```

### Updating Application Status (Admin)

```bash
# Accept an application
curl -X PATCH http://localhost:4000/apply/<application-id> \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: your-admin-secret-key" \
  -d '{"status": "accepted"}'

# Reject an application
curl -X PATCH http://localhost:4000/apply/<application-id> \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: your-admin-secret-key" \
  -d '{"status": "rejected"}'
```

---

## 🎨 UI Pages

| Route                    | Description                                              |
|--------------------------|----------------------------------------------------------|
| `/`                      | Landing page with hero, features, and CTA                |
| `/login`                 | GitHub OAuth login page                                  |
| `/dashboard`             | Developer dashboard with profile and recommended tasks   |
| `/tasks`                 | Full task marketplace with search and skill filters      |
| `/applications`          | My Applications — full list with status and Withdraw btn |
| `/profile/[username]`    | Public shareable developer portfolio (no login needed)   |

---

## ⚡ Skill Scoring Algorithm

The skill score (0–100) is calculated as:

| Component        | Max Points | Logic                                        |
|------------------|-----------|----------------------------------------------|
| Repo Count       | 25        | Linear scale: 10+ repos = full marks         |
| Stars            | 25        | Linear scale: 50+ total stars = full marks   |
| Language Diversity | 25      | 5+ unique languages = full marks             |
| Activity         | 25        | % of repos pushed to in last 6 months        |

**Skill Levels:**
- 🔵 **Beginner**: 0–39
- 🟡 **Intermediate**: 40–69
- 🟢 **Advanced**: 70–100

---

## 🚀 Deployment

### Backend (Railway / Render / Fly.io)

1. Set all environment variables in your hosting platform
2. Update `GITHUB_CALLBACK_URL` to your production backend URL
3. Run `npm run build && npm start`

### Frontend (Vercel)

1. Import the `frontend/` folder to Vercel
2. Set `NEXT_PUBLIC_API_URL` to your production backend URL
3. Deploy

### Database (Supabase / Railway)

1. Create a PostgreSQL database
2. Copy the connection string to `DATABASE_URL`
3. Run `npx prisma migrate deploy`

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License — built for African developers. 🌍