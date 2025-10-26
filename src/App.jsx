import { useState } from "react";
import AuthCard from "./components/AuthCard";
import TaskBoard from "./components/TaskBoard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  function handleAuthed(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4">
      {!token ? (
        <AuthCard onAuthed={handleAuthed} />
      ) : (
        <TaskBoard token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}