import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api";

export default function TaskBoard({ token, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const data = await api("/tasks", "GET", null, token);
      setTasks(data);
    } catch (e) {
      setErr(e.message || "Load failed");
    }
  }

  async function createTask() {
    if (!title.trim()) return;
    await api("/tasks", "POST", { title }, token);
    setTitle("");
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        <button className="px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700" onClick={onLogout}>Logout</button>
      </div>

      <div className="flex gap-2 mb-4">
        <input className="input flex-1" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="New task title" />
        <button className="btn" onClick={createTask}>Create</button>
        <button className="px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700" onClick={load}>Refresh</button>
      </div>
      {err && <p className="text-rose-600 text-sm mb-3">{err}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        {tasks.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card p-4"
          >
            <div className="text-sm text-slate-500">{t.status}</div>
            <div className="font-semibold">{t.title}</div>
            {t.description && <div className="text-sm mt-1">{t.description}</div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
