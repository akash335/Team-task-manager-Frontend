# Team Task Manager — Backend (Express + Postgres)

Fast Express API with JWT auth and a simple task model on Postgres (Neon/Supabase).

## Run locally
```bash
npm ci
cp .env.example .env
# Update .env (DATABASE_URL, JWT_SECRET, CORS_ORIGIN)
npm start
# Health: http://localhost:3000/health
```

## Deploy on Render
- **Service type:** Web Service (Node.js)
- **Root Directory (monorepo):** `/` (if this repo alone) or `/Backend` if used from monorepo
- **Build Command:** `npm ci` (or `npm install`)
- **Start Command:** `node server.js`
- **Node version:** 20 LTS
- **Env Vars:**
  - `PORT=10000` (Render sets this automatically, your code reads `process.env.PORT`)
  - `HOST=0.0.0.0`
  - `DATABASE_URL=postgresql://...?...sslmode=require`
  - `JWT_SECRET=...`
  - `CORS_ORIGIN=https://YOUR-FRONTEND.vercel.app`
```

The server exposes `/register`, `/login`, `/tasks`, `/tasks/:id`, `/tasks/:id/status`.
