const navItems = [
  ["Lernbereiche", "/#lernbereiche"],
  ["Spezial-Labs", "/#training"],
  ["Heute trainieren", "/training/journey"],
  ["Fortschritt", "/#fortschritt"],
] as const;

export function TopNav() {
  return (
    <header className="topbar">
      <a className="brand" href="/#top" aria-label="Neburion XV73 KogTrain Startseite">
        <span className="brandMark" aria-hidden="true">N</span>
        <span><strong>Neburion XV73</strong><small>KogTrain V6.6 · Raptor Delta V10.3</small></span>
      </a>
      <nav aria-label="Hauptnavigation">
        {navItems.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
      </nav>
    </header>
  );
}
