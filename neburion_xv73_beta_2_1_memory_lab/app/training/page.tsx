import { AppShell } from "@/components/layout/AppShell";
import { ExerciseRunner } from "@/components/training/ExerciseRunner";

export default function Training() {
  return <AppShell sidebar>
    <div className="panel">
      <span className="eyebrow">Exercise Runner 2.0</span>
      <h1>Eine zentrale Engine für unterschiedliche Übungsformen.</h1>
      <p className="lead">Der Runner verwaltet Aufgabenserien, Antwortzustände, nächste Aufgabe, Zeitmessung, Teilpunkte, Feedback, Strategiehinweise und Speicherung zentral. Gedächtnisübungen mit echter Merkphase laufen im Memory Lab.</p>
    </div>
    <ExerciseRunner sessionSize={6} />
  </AppShell>;
}
