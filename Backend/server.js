// Backend/server.js
const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

app.use(cors());
app.options('*', cors());
app.use(express.json());

// serve frontend (Frontend/public)
app.use(express.static(path.join(__dirname, '../Frontend/public')));

// simple health check
app.get('/api/health', (_, res) => res.json({ ok: true, port: PORT }));

// ---- DB ----
const db = new Database(path.join(__dirname, 'team.db'));
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  assignee_id INTEGER,
  creator_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

function toSafeUser(u){ return { id: u.id, name: u.name, email: u.email }; }
function signToken(user){ return jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: '7d' }); }
function auth(req,res,next){
  const h=req.headers.authorization||'';
  const token=h.startsWith('Bearer ')? h.slice(7): null;
  if(!token) return res.status(401).json({error:'Missing token'});
  try{
    const p=jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id,name,email FROM users WHERE id=?').get(p.uid);
    if(!user) return res.status(401).json({error:'User not found'});
    req.user=user; next();
  }catch(e){ return res.status(401).json({error:'Invalid token'}); }
}

// ---- Auth ----
app.post('/api/auth/register', (req,res)=>{
  const {name,email,password}=req.body||{};
  if(!name||!email||!password) return res.status(400).json({error:'name, email, password required'});
  if(String(password).length<6) return res.status(400).json({error:'password too short'});
  const hash=bcrypt.hashSync(String(password),10);
  try{
    const info=db.prepare('INSERT INTO users(name,email,password_hash) VALUES (?,?,?)')
      .run(String(name).trim(), String(email).toLowerCase().trim(), hash);
    const user=db.prepare('SELECT id,name,email FROM users WHERE id=?').get(info.lastInsertRowid);
    res.json({user: toSafeUser(user)});
  }catch(e){
    if(String(e.message).includes('UNIQUE')) return res.status(409).json({error:'email already exists'});
    res.status(500).json({error:'failed to register'});
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email=?')
                 .get(String(email).toLowerCase().trim());
  if (!user) return res.status(401).json({ error: 'invalid credentials (email)' });

  const ok = bcrypt.compareSync(String(password), user.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials (password)' });

  // optional name check (only if provided)
  if (name !== undefined && name !== null && String(name).trim() !== '') {
    const matches = String(name).trim().toLowerCase() === String(user.name).trim().toLowerCase();
    if (!matches) return res.status(401).json({ error: 'name does not match this account' });
  }

  const token = signToken(user);
  return res.json({ token, user: toSafeUser(user) });
});

app.get('/api/me', auth, (req,res)=> res.json({user:req.user}));
app.get('/api/users', auth, (req,res)=>{
  const users = db.prepare('SELECT id,name,email FROM users ORDER BY name').all();
  res.json({users});
});

// ---- Tasks ----
app.get('/api/tasks', auth, (req,res)=>{
  const { status } = req.query;
  let sql='SELECT * FROM tasks'; const where=[]; const args=[];
  if(status){ where.push('status=?'); args.push(status); }
  if(where.length) sql+=' WHERE '+where.join(' AND ');
  sql+=' ORDER BY due IS NULL, due ASC, created_at DESC';
  const rows=db.prepare(sql).all(...args);
  res.json({tasks:rows});
});

app.post('/api/tasks', auth, (req,res)=>{
  const {title,description,due,status='pending'}=req.body||{};
  if(!title) return res.status(400).json({error:'title required'});
  const dueMs=(due===null||due===undefined||due==='')? null : Number(due);
  const info=db.prepare('INSERT INTO tasks(title,description,due,status,assignee_id,creator_id) VALUES (?,?,?,?,?,?)')
    .run(String(title).trim(), description? String(description): null, dueMs, status, null, req.user.id);
  const row=db.prepare('SELECT * FROM tasks WHERE id=?').get(info.lastInsertRowid);
  res.json({task:row});
});

app.patch('/api/tasks/:id', auth, (req,res)=>{
  const id=Number(req.params.id);
  const row=db.prepare('SELECT * FROM tasks WHERE id=?').get(id);
  if(!row) return res.status(404).json({error:'not found'});
  const {title,description,due,status}=req.body||{};
  const updated={
    title: title!==undefined? String(title).trim(): row.title,
    description: description!==undefined? String(description): row.description,
    due: due!==undefined? (due===''||due===null? null: Number(due)) : row.due,
    status: status!==undefined? String(status): row.status
  };
  db.prepare(`UPDATE tasks SET title=@title, description=@description, due=@due, status=@status, updated_at=datetime('now') WHERE id=${id}`).run(updated);
  const out=db.prepare('SELECT * FROM tasks WHERE id=?').get(id);
  res.json({task:out});
});

app.delete('/api/tasks/:id', auth, (req,res)=>{
  const id=Number(req.params.id);
  db.prepare('DELETE FROM tasks WHERE id=?').run(id);
  res.json({ok:true});
});

// (optional) SPA fallback so direct / routes load index.html
app.get('*', (_,res) =>
  res.sendFile(path.join(__dirname, '../Frontend/public/index.html'))
);

// ---- SINGLE listen (no duplicates) ----
const host = process.env.HOST || '0.0.0.0';
app.listen(PORT, host, () => {
  console.log(`Server on http://${host}:${PORT}`);
});
