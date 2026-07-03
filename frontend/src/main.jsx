// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import App from "./App";

// ✅ Smart StrictMode wrapper
const isDev = import.meta.env.MODE === "development";

console.log("🟢 main.jsx started (mode:", isDev ? "development" : "production", ")");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ #root element not found!");
} else {
  console.log("✅ #root found, rendering App...");
}

const root = ReactDOM.createRoot(rootElement);

if (isDev) {
  // ⚙️ In dev mode: disable StrictMode to prevent double rendering / disappearing UI
  root.render(<App />);
  console.log("🚀 Rendering App without StrictMode (development mode)");
} else {
  // 🧠 In production: enable StrictMode for safety
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("🧩 Rendering App with StrictMode (production mode)");
}
