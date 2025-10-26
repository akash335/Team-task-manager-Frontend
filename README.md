# 🚀 Team Task Manager — Frontend (Vite + React)

A modern **task management web app** built with React, Tailwind CSS, and Framer Motion — designed to manage and sync tasks across users in real time with a PostgreSQL backend hosted on Render.

---

##  Tech Stack
- **Frontend:** React (Vite) + TailwindCSS + Framer Motion  
- **Backend:** Express + PostgreSQL (hosted on Render)  
- **Deployment:** Vercel (Frontend) + Render (Backend)

---

## ⚙️ Scripts

| Command | Description |
|----------|--------------|
| `npm run dev` | Start local development server at [http://localhost:5173](http://localhost:5173) |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

---

## 🌍 Environment Variables

Create a `.env` file in the project root and set:

```bash
VITE_API_BASE=https://your-backend.onrender.com

🧪 Development Setup

Clone the repository:

git clone https://github.com/your-username/team-task-manager-frontend.git
cd team-task-manager-frontend


## Install dependencies:

   npm install


##Run locally:

  npm run dev


Visit http://localhost:5173

🪄 Features

🔐 Secure Login / Register (JWT-based)

🗂️ Create, edit, and delete tasks

✅ Mark tasks as Completed / Active

🔍 Filter by All / Active / Completed

🕒 Add due date & description

⚡ Real-time sync via PostgreSQL

🎨 Elegant UI built with Tailwind & Framer Motion

🚢 Deploy on Vercel

##Go to Vercel Dashboard

Create a New Project → import this repo.

Configure:

Framework: Vite

Root Directory: /

Install Command: npm ci (or npm install)

Build Command: npm run build

Output Directory: dist

Add Environment Variable:

VITE_API_BASE=https://your-backend.onrender.com


Deploy 🚀
______

The included vercel.json rewrites all routes to index.html for SPA routing.

Folder Structure
team-task-manager-frontend/
├── public/
├── src/
│   ├── api.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── TaskBoard.jsx
│   └── index.css
├── package.json
└── vite.config.js

Backend Repository

Backend source: https://github.com/akash335/Team-task-manager-Backend.git

Example: .env for Backend
PORT=3000
JWT_SECRET=your-secret
DATABASE_URL=postgresql://user:password@host:port/dbname
CORS_ORIGIN=http://localhost:5173,https://your-frontend.vercel.app

🪶 Author

Porumamilla_Akash — Full Stack Developer
🔗 https://github.com/akash335/Team-task-manager-Frontend
