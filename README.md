# Team Task Manager — Frontend (Vite + React)

This is the frontend single-page app for Team Task Manager.

## Scripts
- `npm run dev` — local dev at http://localhost:5173
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build

## Env
- `VITE_API_BASE` — base URL of the backend API (e.g. `https://your-backend.onrender.com`).

## Deploy on Vercel
- Framework: **Vite**
- Root Directory: **/** (project root)
- Install Command: `npm ci` (or `npm install`)
- Build Command: `npm run build`
- Output Directory: `dist`
- Add Project Env: `VITE_API_BASE=https://<your-render-domain>`

The included `vercel.json` rewrites all routes to `index.html` for SPA routing.
