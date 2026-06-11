"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "");
    try {
      localStorage.setItem("sing:theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Changer de thème"
      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground hover:border-primary transition"
    >
      {dark ? "Clair" : "Sombre"}
    </button>
  );
}
