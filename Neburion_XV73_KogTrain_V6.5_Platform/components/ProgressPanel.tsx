export function ProgressPanel() {
  const metrics = [
    ["Wochenziel", "3 / 5"],
    ["Trainingszeit", "48 min"],
    ["Serie", "4 Tage"],
  ];
  return (
    <section className="progressPanel" id="fortschritt" aria-labelledby="progress-title">
      <div>
        <p className="eyebrow">Fortschritt</p>
        <h2 id="progress-title">Klar sehen, was sich entwickelt.</h2>
        <p className="sectionCopy">V6.5 trennt Training, Fortschritt und Empfehlungen sauber. Werte sollen verständlich bleiben und keine medizinische Bewertung darstellen.</p>
      </div>
      <div className="metricGrid">
        {metrics.map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
    </section>
  );
}
