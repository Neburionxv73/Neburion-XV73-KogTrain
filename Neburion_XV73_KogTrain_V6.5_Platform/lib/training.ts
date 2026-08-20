export type TrainingWorld = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  status: "ready" | "planned";
  accent: string;
};

export const trainingWorlds: TrainingWorld[] = [
  { id: "memory", title: "Memory Lab", shortTitle: "Gedächtnis", description: "Arbeitsgedächtnis, Merkstrategien und Abruf trainieren.", status: "ready", accent: "M" },
  { id: "attention", title: "Attention Lab", shortTitle: "Aufmerksamkeit", description: "Fokus, Reizfilterung und Reaktionskontrolle stärken.", status: "ready", accent: "A" },
  { id: "logic", title: "Logic Lab", shortTitle: "Logik", description: "Muster, Regeln und problemlösendes Denken üben.", status: "ready", accent: "L" },
  { id: "language", title: "Language Lab", shortTitle: "Sprache", description: "Wortabruf, Begriffe und sprachliche Flexibilität trainieren.", status: "ready", accent: "S" },
  { id: "visual", title: "Visual Lab", shortTitle: "Visuell", description: "Visuelle Verarbeitung, Raumlage und Mustererkennung fördern.", status: "ready", accent: "V" }
];
