import React from "react";
import AuthCard from "./components/AuthCard.jsx";
import TaskBoard from "./components/TaskBoard.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Team Task Manager</h1>
      <div className="flex flex-col gap-6 w-full max-w-md">
        <AuthCard />
        <TaskBoard />
      </div>
    </div>
  );
}
