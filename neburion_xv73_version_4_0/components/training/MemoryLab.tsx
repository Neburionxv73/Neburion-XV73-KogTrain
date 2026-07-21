"use client";

import { useMemo, useState } from "react";
import { memoryExerciseLibrary } from "@/data/memory-exercises";
import { ExerciseRunner } from "@/components/training/ExerciseRunner";
import type { Difficulty } from "@/features/cognitive-engine/types";

const levels: { value: Difficulty; label: string; description: string }[] = [
  { value: "einstieg", label: "Einstieg", description: "Kurze Merkphasen und wenige Elemente." },
  { value: "leicht", label: "Leicht", description: "Mehr Inhalte, weiterhin klare Unterschiede." },
  { value: "mittel", label: "Mittel", description: "Mehr Elemente und stärkere Abrufleistung." },
  { value: "schwer", label: "Schwer", description: "Ähnliche Inhalte und längere Folgen." },
  { value: "profi", label: "Profi", description: "Hohe Informationsdichte und komplexe Details." }
];

export function MemoryLab() {
  const [difficulty, setDifficulty] = useState<Difficulty>("leicht");
  const filtered = useMemo(() => memoryExerciseLibrary.filter((exercise) => exercise.difficulty === difficulty), [difficulty]);

  return <>
    <div className="panel memory-level-panel">
      <span className="eyebrow">Schwierigkeitsgrad wählen</span>
      <div className="difficulty-grid">
        {levels.map((level) => <button
          key={level.value}
          className={`difficulty-card ${difficulty === level.value ? "is-active" : ""}`}
          onClick={() => setDifficulty(level.value)}
        >
          <strong>{level.label}</strong>
          <span>{level.description}</span>
        </button>)}
      </div>
    </div>
    <ExerciseRunner
      key={difficulty}
      exercises={filtered}
      sessionSize={5}
      sessionLabel={`Memory Lab · ${difficulty}`}
    />
  </>;
}
