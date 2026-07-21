import type { Difficulty } from "@/features/cognitive-engine/types";

export type AttentionCategory = "Visuelle Suche" | "Reaktion" | "Farbkonflikt" | "Zahlensuche" | "Doppelaufgabe";

export type AttentionPreset = {
  difficulty: Difficulty;
  gridSize: number;
  targetCount: number;
  distractorSimilarity: number;
  reactionRounds: number;
  minDelay: number;
  maxDelay: number;
};

export const attentionLevels: { value: Difficulty; label: string; description: string }[] = [
  { value: "einstieg", label: "Einstieg", description: "Wenige Reize, klare Unterschiede und großzügige Reaktionszeit." },
  { value: "leicht", label: "Leicht", description: "Mehr Reize und erste ähnliche Ablenkungen." },
  { value: "mittel", label: "Mittel", description: "Dichtere Felder, mehrere Zielobjekte und stärkere Konkurrenzreize." },
  { value: "schwer", label: "Schwer", description: "Hohe Reizdichte, sehr ähnliche Ablenkungen und kombinierte Regeln." },
  { value: "profi", label: "Profi", description: "Maximale Dichte, kurze Reaktionsfenster und anspruchsvolle Doppelregeln." }
];

export const attentionPresets: Record<Difficulty, AttentionPreset> = {
  einstieg: { difficulty: "einstieg", gridSize: 20, targetCount: 3, distractorSimilarity: 1, reactionRounds: 4, minDelay: 900, maxDelay: 1800 },
  leicht: { difficulty: "leicht", gridSize: 28, targetCount: 4, distractorSimilarity: 2, reactionRounds: 5, minDelay: 800, maxDelay: 1700 },
  mittel: { difficulty: "mittel", gridSize: 40, targetCount: 6, distractorSimilarity: 3, reactionRounds: 6, minDelay: 700, maxDelay: 1550 },
  schwer: { difficulty: "schwer", gridSize: 56, targetCount: 8, distractorSimilarity: 4, reactionRounds: 7, minDelay: 600, maxDelay: 1400 },
  profi: { difficulty: "profi", gridSize: 72, targetCount: 10, distractorSimilarity: 5, reactionRounds: 8, minDelay: 500, maxDelay: 1200 }
};

export const attentionCategories: { key: AttentionCategory; icon: string; title: string; description: string }[] = [
  { key: "Visuelle Suche", icon: "◉", title: "Visuelle Suche", description: "Finde Zielreize systematisch zwischen ähnlichen Ablenkungen." },
  { key: "Reaktion", icon: "⚡", title: "Reaktion", description: "Reagiere erst auf das echte Zielsignal und vermeide Fehlstarts." },
  { key: "Farbkonflikt", icon: "🎨", title: "Farbkonflikt", description: "Benenne die sichtbare Farbe und hemme die automatische Lesereaktion." },
  { key: "Zahlensuche", icon: "#", title: "Zahlensuche", description: "Scanne Zahlenfelder und markiere alle geforderten Zielzahlen." },
  { key: "Doppelaufgabe", icon: "◇", title: "Doppelaufgabe", description: "Beachte zwei Regeln gleichzeitig und filtere nur passende Karten." }
];
