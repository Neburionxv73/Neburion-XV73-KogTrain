const navItems = ["Training", "Fortschritt", "Coach", "Profil"];

export function TopNav() {
  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Neburion XV73 Startseite">
        <span className="brandMark" aria-hidden="true">N</span>
        <span><strong>Neburion XV73</strong><small>Kognitive Trainingsplattform · V6.5</small></span>
      </a>
      <nav aria-label="Hauptnavigation">
        {navItems.map((item) => <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>)}
      </nav>
    </header>
  );
}
