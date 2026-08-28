const navItems = [
  ["Lernbereiche", "/#lernbereiche"],
  ["Spezial-Labs", "/#training"],
  ["Heute trainieren", "/training/journey"],
  ["Fortschritt", "/#fortschritt"],
] as const;

export function TopNav() {
  return (
    <header className="topbar">
      <a className="brand" href="/#top">
        <span className="brandMark" aria-hidden="true">N</span>
        <span><strong>Neburion XV73</strong><small>Lern- & Trainingsplattform · KogTrain V6.6</small></span>
      </a>
      <nav aria-label="Hauptnavigation">
        {navItems.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
      </nav>
    </header>
  );
}
