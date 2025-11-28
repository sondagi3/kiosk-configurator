import React from "react";
import { createRoot } from "react-dom/client";
import TaskManager from "./components/TaskManager.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TaskManager />
  </React.StrictMode>
);
