import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api";

export default function TaskBoard({ token, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
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
    try {
      await api("/tasks", "POST", { title, description, due }, token);
      setTitle("");
      setDescription("");
      setDue("");
      load();
    } catch (e) {
      setErr(e.message || "Failed to create");
    }
  }

  async function deleteTask(id) {
    await api(`/tasks/${id}`, "DELETE", null, token);
    load();
  }

  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await api(`/tasks/${id}`, "PUT", { status: newStatus }, token);
    load();
  }

  const filtered = tasks.filter((t) => {
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && t.status === "pending") ||
      (statusFilter === "completed" && t.status === "completed");
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span className="text-indigo-400 text-5xl leading-none">•</span> Task Manager
        </h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm border border-slate-600 rounded-xl hover:bg-slate-800"
        >
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT PANEL */}
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Tasks</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2">
              {["all", "active", "completed"].map((f) => (
                <label key={f} className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={statusFilter === f}
                    onChange={() => setStatusFilter(f)}
                  />
                  {f[0].toUpperCase() + f.slice(1)}
                </label>
              ))}
            </div>
            <input
              placeholder="Search title/desc"
              className="input w-40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="px-3 py-2 text-sm border border-slate-600 rounded-xl"
              onClick={load}
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3 mt-3 max-h-[60vh] overflow-auto pr-2">
            {filtered.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-800 p-4 rounded-xl flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.status === "completed"}
                    onChange={() => toggleStatus(t.id, t.status)}
                    className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  />
                  <div>
                    <div
                      className={`font-semibold ${
                        t.status === "completed"
                          ? "line-through text-slate-500"
                          : ""
                      }`}
                    >
                      {t.title}
                    </div>
                    {t.description && (
                      <div className="text-sm text-slate-400">
                        {t.description}
                      </div>
                    )}
                    {t.due && (
                      <div className="text-xs text-slate-500 mt-1">
                        Due: {new Date(t.due).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(t.id)}
                  className="px-3 py-1 text-sm rounded-lg border border-rose-500 text-rose-400 hover:bg-rose-600 hover:text-white"
                >
                  Delete
                </button>
              </motion.div>
            ))}
          </div>
          {err && <p className="text-rose-500 text-sm">{err}</p>}
        </div>

        {/* RIGHT PANEL */}
        <div className="card p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Add Task</h2>
          <div className="space-y-2">
            <label className="text-sm">Title</label>
            <input
              className="input"
              placeholder="e.g., Submit report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Description</label>
            <textarea
              className="input h-20 resize-none"
              placeholder="Optional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Due date & time</label>
            <input
              type="datetime-local"
              className="input"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </div>
          <button
            onClick={createTask}
            className="btn w-full font-semibold text-lg"
          >
            Save Task
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center mt-6">
        Built with React & Tailwind. Tasks synced via PostgreSQL on Render.
      </p>
    </div>
  );
}