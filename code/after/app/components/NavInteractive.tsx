"use client"; // ✅ Minimal client island — only the toggle button ships JS

import { useState } from "react";

export default function NavInteractive() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <button
      onClick={() => {
        setDarkMode((d) => !d);
        document.documentElement.classList.toggle("dark");
      }}
      className="px-3 py-1 rounded border text-sm"
    >
      {darkMode ? "Light" : "Dark"}
    </button>
  );
}
