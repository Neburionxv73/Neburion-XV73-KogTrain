import { AppShell } from "@/components/layout/AppShell";
import config from "@/data/app-config.json";
import releases from "@/data/release-notes.json";

const workstreams = [
  { name: "Experience Engine", status: "Aktiv", detail: "Designsystem, Navigation, Responsive UI und Mikrointeraktionen." },
  { name: "Cognitive Engine", status: "Aktiv", detail: "Exercise Runner, Aufgabentypen und adaptive Schwierigkeit." },
  { name: "Progress Engine", status: "Beta", detail: "Lokale Ergebnisse, Verlauf, Ziele und Auswertung." },
  { name: "Coach Engine", status: "Beta", detail: "Nachvollziehbare Empfehlungen auf Basis gespeicherter Ergebnisse." }
];

const roadmap = [
  ["Sprint 0", "Foundation", "Abgeschlossen"],
  ["Sprint 1", "Exercise Runner", "Abgeschlossen"],
  ["Sprint 2", "Dashboard 2.0", "In Planung"],
  ["Sprint 3", "Exercise Library", "Geplant"],
  ["Sprint 4", "Adaptive Learning", "Geplant"],
  ["Sprint 5", "Beta Deployment", "Vorbereitet"]
];

export default function DeveloperCenterPage() {
  return <AppShell sidebar>
    <section className="panel dev-hero">
      <span className="eyebrow">Neburion Product Studio</span>
      <h1>Developer Center</h1>
      <p className="lead">Zentrale Übersicht über Architektur, Qualität, Roadmap und Releases der Lern-App.</p>
      <div className="actions">
        <a className="btn btn-primary" href="/product-manifest">Produktmanifest lesen</a>
        <a className="btn btn-secondary" href="/training">Exercise Runner testen</a>
      </div>
    </section>

    <section className="stat-grid">
      <div className="stat"><strong>{config.version}</strong><span>Version</span></div>
      <div className="stat"><strong>{config.channel}</strong><span>Release-Kanal</span></div>
      <div className="stat"><strong>4</strong><span>Produkt-Engines</span></div>
      <div className="stat"><strong>Build Ready</strong><span>Deployment</span></div>
    </section>

    <section className="panel">
      <span className="eyebrow">Systemarchitektur</span>
      <h2>Vier Engines, ein Lernsystem.</h2>
      <div className="grid dev-grid">
        {workstreams.map(item => <article className="card" key={item.name}>
          <span className="status-chip">{item.status}</span>
          <h3>{item.name}</h3>
          <p>{item.detail}</p>
        </article>)}
      </div>
    </section>

    <section className="panel">
      <span className="eyebrow">Roadmap</span>
      <h2>Entwicklung in kontrollierten Sprints.</h2>
      <div className="roadmap-list">
        {roadmap.map(([sprint,title,status]) => <div className="roadmap-row" key={sprint}>
          <div><strong>{sprint}</strong><span>{title}</span></div><span className="status-chip">{status}</span>
        </div>)}
      </div>
    </section>

    <section className="panel">
      <span className="eyebrow">Release Notes</span>
      <h2>Nachvollziehbare Entwicklung.</h2>
      <div className="release-list">
        {releases.map(release => <article className="release-card" key={release.version}>
          <div><strong>{release.version}</strong><span>{release.date}</span></div>
          <h3>{release.title}</h3>
          <ul>{release.items.map(item => <li key={item}>{item}</li>)}</ul>
        </article>)}
      </div>
    </section>
  </AppShell>;
}
