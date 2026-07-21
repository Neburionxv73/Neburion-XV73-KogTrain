import { AppShell } from "@/components/layout/AppShell";

const principles = [
  ["Klarheit vor Menge", "Jede Funktion muss verständlich, sinnvoll und auf den nächsten Lernschritt ausgerichtet sein."],
  ["Motivation ohne Druck", "Fortschritt wird sichtbar gemacht, ohne Nutzer zu überfordern oder zu bewerten."],
  ["Training statt Diagnose", "Neburion XV73 ist ein Lern- und Trainingssystem und ersetzt keine medizinische Behandlung."],
  ["Transparente Empfehlungen", "Coach-Hinweise müssen aus realen Trainingsdaten ableitbar und nachvollziehbar sein."],
  ["Ein System statt Insellösungen", "Neue Module nutzen gemeinsame Komponenten, Datenmodelle und Qualitätsregeln."],
  ["Barrierearme Qualität", "Kontrast, Fokus, Lesbarkeit, reduzierte Bewegung und mobile Bedienbarkeit sind Pflicht." ]
];

export default function ProductManifestPage(){
  return <AppShell sidebar>
    <section className="panel manifest-hero">
      <span className="eyebrow">Neburion Manifest</span>
      <h1>Wir entwickeln ein Lernsystem, das Menschen stärkt.</h1>
      <p className="lead">Neburion XV73 verbindet kognitives Training, klare Routinen, nachvollziehbare Auswertung und eine ruhige, hochwertige Benutzererfahrung.</p>
    </section>
    <section className="grid manifest-grid">
      {principles.map(([title,text],index)=><article className="card principle-card" key={title}>
        <span className="principle-number">{String(index+1).padStart(2,"0")}</span>
        <h2>{title}</h2><p>{text}</p>
      </article>)}
    </section>
    <section className="panel">
      <span className="eyebrow">Produktversprechen</span>
      <h2>Jeder Sprint muss echten Nutzen schaffen.</h2>
      <p>Eine neue Funktion wird nur übernommen, wenn sie zur Produktvision passt, stabil umgesetzt ist, auf Mobilgeräten funktioniert und langfristig erweiterbar bleibt.</p>
      <a className="btn btn-primary" href="/developer-center">Zum Developer Center</a>
    </section>
  </AppShell>;
}
