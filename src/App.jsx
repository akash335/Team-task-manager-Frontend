import React, { useState } from "react";
import AuthCard from "./components/AuthCard";
import TaskBoard from "./components/TaskBoard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  function handleLogin(tok) {
    localStorage.setItem("token", tok);
    setToken(tok);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      {!token ? (
        <AuthCard onAuthed={handleLogin} />
      ) : (
        <TaskBoard token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}
