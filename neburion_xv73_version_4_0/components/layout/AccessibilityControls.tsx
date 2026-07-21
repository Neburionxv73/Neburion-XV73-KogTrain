"use client";

import { useEffect, useState } from "react";

type ReadingMode = "standard" | "focus";

export function AccessibilityControls() {
  const [mode, setMode] = useState<ReadingMode>("standard");

  useEffect(() => {
    const saved = window.localStorage.getItem("neburion-reading-mode") as ReadingMode | null;
    if (saved === "focus") setMode("focus");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.readingMode = mode;
    window.localStorage.setItem("neburion-reading-mode", mode);
  }, [mode]);

  return <button
    type="button"
    className="reading-mode-toggle"
    aria-pressed={mode === "focus"}
    aria-label={mode === "focus" ? "Standardansicht aktivieren" : "Fokusansicht mit stärkerem Kontrast aktivieren"}
    onClick={() => setMode(current => current === "focus" ? "standard" : "focus")}
  >
    <span aria-hidden="true">◐</span>
    <span>{mode === "focus" ? "Standard" : "Fokus"}</span>
  </button>;
}
