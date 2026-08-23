const navItems = [
  ["Lernbereiche", "/#lernbereiche"],
  ["Training", "/training/journey"],
  ["Fortschritt", "/#fortschritt"],
  ["Coach", "/#coach"],
] as const;

export function TopNav() {
  return (
    <header className="topbar">
      <a className="brand" href="/#top" aria-label="Neburion XV73 Startseite">
        <span className="brandMark" aria-hidden="true">N</span>
        <span><strong>Neburion XV73</strong><small>Lern- & Trainingsplattform · V6.5</small></span>
      </a>
      <nav aria-label="Hauptnavigation">
        {navItems.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
      </nav>
    </header>
  );
}
