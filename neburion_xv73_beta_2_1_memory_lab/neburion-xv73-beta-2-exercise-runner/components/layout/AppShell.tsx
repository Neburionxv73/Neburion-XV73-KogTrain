import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  ["/dashboard", "Dashboard"],
  ["/training", "Training"],
  ["/memory-lab", "Memory Lab"],
  ["/coach", "Coach"],
  ["/progress", "Fortschritt"],
  ["/developer-center", "Studio"],
  ["/settings", "Einstellungen"]
];

export function AppShell({ children, sidebar = false }: { children: ReactNode; sidebar?: boolean }) {
  return <div className="shell">
    <div className="ambient"><div className="orb one"/><div className="orb two"/><div className="ribbon"/></div>
    <header className="topbar"><div className="container topbar-inner">
      <Link href="/" className="brand"><span className="brand-mark">N</span><span>NEBURION XV73</span></Link>
      <nav className="nav">{links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    </div></header>
    {sidebar ? <div className="container layout"><aside className="sidebar">{links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</aside><main className="content">{children}</main></div> : children}
    <footer className="footer"><div className="container">Neburion XV73 · Kognitives Lernsystem · Training ersetzt keine medizinische Diagnose oder Therapie.</div></footer>
  </div>;
}
