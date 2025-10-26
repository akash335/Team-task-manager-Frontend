require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
const DATABASE_URL = process.env.DATABASE_URL;

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors());
app.use(express.json());

if (!DATABASE_URL) console.warn('[WARN] DATABASE_URL is not set.');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initSql = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

async function init() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(initSql);
    await client.query('COMMIT');
    console.log('[DB] Schema ready');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[DB] Init failed:', e);
  } finally {
    client.release();
  }
}
init();

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }
}

app.get('/health', (_,res) => res.status(200).send('ok'));

app.post('/register', async (req,res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      'INSERT INTO users(name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name,email,created_at',
      [name, email, hash]
    );
    const user = rows[0];
    const token = createToken(user);
    res.json({ user, token });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req,res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = createToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/tasks', auth, async (req,res) => {
  const uid = req.user.id;
  const { rows } = await pool.query(
    `SELECT t.*, a.name AS assignee_name, c.name AS creator_name
       FROM tasks t
       LEFT JOIN users a ON a.id = t.assignee_id
       LEFT JOIN users c ON c.id = t.creator_id
      WHERE t.creator_id = $1 OR t.assignee_id = $1
      ORDER BY t.created_at DESC`,
    [uid]
  );
  res.json(rows);
});

app.post('/tasks', auth, async (req,res) => {
  const { title, description, due, assignee_id } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  const uid = req.user.id;
  const { rows } = await pool.query(
    `INSERT INTO tasks (title, description, due, assignee_id, creator_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [title, description || null, due || null, assignee_id || null, uid]
  );
  res.json(rows[0]);
});

app.put('/tasks/:id', auth, async (req,res) => {
  const id = Number(req.params.id);
  const { title, description, due, assignee_id, status } = req.body || {};
  const { rows } = await pool.query(
    `UPDATE tasks SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       due = COALESCE($3, due),
       assignee_id = COALESCE($4, assignee_id),
       status = COALESCE($5, status)
     WHERE id = $6
     RETURNING *`,
    [title, description, due, assignee_id, status, id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Task not found' });
  res.json(rows[0]);
});

app.patch('/tasks/:id/status', auth, async (req,res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status required' });
  const { rows } = await pool.query(`UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *`, [status, id]);
  if (!rows.length) return res.status(404).json({ error: 'Task not found' });
  res.json(rows[0]);
});

app.delete('/tasks/:id', auth, async (req,res) => {
  const id = Number(req.params.id);
  const r = await pool.query('DELETE FROM tasks WHERE id=$1', [id]);
  res.json({ ok: true, deleted: r.rowCount });
});

const host = process.env.HOST || '0.0.0.0';
app.listen(PORT, host, () => console.log(`Server on http://${host}:${PORT}`));
