"use client";
import { useSyncExternalStore } from "react";

// L'attribut data-theme du <html> est la source de vérité (posé avant
// l'hydratation par le script du layout) — on s'y synchronise sans setState.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  function toggle() {
    const next = !dark;
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
