import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { motion } from "framer-motion";
import AuthCard from "./components/AuthCard";
import TaskBoard from "./components/TaskBoard";

function App() {
  const [token, setToken] = useState("");
  return (
    <div className="min-h-full flex items-center justify-center p-6">
      {!token ? (
        <AuthCard onAuthed={setToken} />
      ) : (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-full">
          <TaskBoard token={token} onLogout={()=>setToken("")} />
        </motion.div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
