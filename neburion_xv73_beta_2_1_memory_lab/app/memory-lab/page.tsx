import { AppShell } from "@/components/layout/AppShell";
import { MemoryLab } from "@/components/training/MemoryLab";

export default function MemoryLabPage() {
  return <AppShell sidebar>
    <div className="panel memory-lab-hero">
      <span className="eyebrow">Memory Lab · Exercise Runner 2.0</span>
      <h1>Merken heißt: erst sehen, dann ohne Hilfe abrufen.</h1>
      <p className="lead">Jede Gedächtnisübung folgt derselben verbindlichen Logik: Anzeigen → Merkzeit → vollständig ausblenden → Abrufen → Feedback → Strategie → nächste Aufgabe.</p>
      <div className="memory-principles">
        <div><strong>5</strong><span>Kategorien</span></div>
        <div><strong>25</strong><span>Übungen</span></div>
        <div><strong>5</strong><span>Schwierigkeitsstufen</span></div>
      </div>
    </div>
    <MemoryLab />
  </AppShell>;
}
