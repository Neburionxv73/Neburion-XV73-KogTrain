import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ModuleCard } from "@/components/dashboard/ModuleCard";

const modules = [
  ["🧠", "Memory Lab", "Informationen aufnehmen, ordnen und sicher abrufen.", 82],
  ["🎯", "Attention Lab", "Zielreize erkennen und Ablenkungen kontrollieren.", 76],
  ["🧩", "Logic Lab", "Muster, Regeln und Zusammenhänge präzise erfassen.", 74],
  ["🗣️", "Language Lab", "Wortfindung, Verständnis und Ausdruck aktivieren.", 79],
  ["👁️", "Visual Lab", "Formen, Rotation und räumliche Beziehungen trainieren.", 71]
] as const;

export default function Home() {
  return <AppShell>
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <span className="eyebrow">Version 4.0 · Strength-Based Platform Release</span>
          <h1>Entdecke, was bereits in dir wächst.</h1>
          <p className="lead">
            Neburion XV73 verbindet fünf abwechslungsreiche Trainingswelten mit einem
            stärkenorientierten Coach, transparentem Fortschritt und einer ruhigen,
            motivierenden Nutzerführung.
          </p>
          <div className="actions">
            <Button href="/onboarding">Persönlich starten</Button>
            <Button href="/session" secondary>Training auswählen</Button>
          </div>
        </div>
        <div className="hero-card">
          <div className="brain-core" />
          <div className="mini-grid">
            <div className="metric"><strong>5</strong><span>Trainingswelten</span></div>
            <div className="metric"><strong>56+</strong><span>geprüfte Übungen</span></div>
            <div className="metric"><strong>100%</strong><span>lokale Kontrolle</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Deine Trainingswelten</span>
            <h2>Abwechslungsreich trainieren. Fortschritt bewusst erleben.</h2>
          </div>
        </div>
        <div className="grid">
          {modules.map(([icon, title, text, progress]) =>
            <ModuleCard key={title} icon={icon} title={title} text={text} progress={progress} />
          )}
        </div>
        <div className="actions">
          <Button href="/dashboard">Dashboard öffnen</Button>
          <Button href="/coach" secondary>Strength Coach ansehen</Button>
          <Button href="/progress" secondary>Fortschritt entdecken</Button>
        </div>
      </div>
    </section>
  </AppShell>;
}
