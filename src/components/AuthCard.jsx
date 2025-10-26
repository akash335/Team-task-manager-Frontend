import React, { useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api";

export default function AuthCard({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  async function submit() {
    try {
      setErr("");
      if (mode === "register") {
        const { token } = await api("/register", "POST", {
          name,
          email,
          password: pwd,
        });
        onAuthed(token);
      } else {
        const { token } = await api("/login", "POST", {
          email,
          password: pwd,
        });
        onAuthed(token);
      }
    } catch (e) {
      setErr(e.message || "Failed");
    }
  }

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="card max-w-md w-full p-6"
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black tracking-tight">
          Team Task Manager
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {mode === "login" ? "Welcome back" : "Create your team account"}
        </p>
      </div>

      {mode === "register" && (
        <div className="space-y-2 mb-3">
          <label className="text-sm">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Akash"
          />
        </div>
      )}

      <div className="space-y-2 mb-3">
        <label className="text-sm">Email</label>
        <input
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Password</label>
        <input
          type="password"
          className="input"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {err && <p className="text-rose-600 text-sm mt-3">{err}</p>}

      <div className="flex items-center gap-3 mt-5">
        <button className="btn flex-1" onClick={submit}>
          {mode === "login" ? "Login" : "Register"}
        </button>
        <button
          className="px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700"
          onClick={() =>
            setMode(mode === "login" ? "register" : "login")
          }
        >
          {mode === "login"
            ? "New here? Register"
            : "Have an account? Login"}
        </button>
      </div>
    </motion.div>
  );
}
