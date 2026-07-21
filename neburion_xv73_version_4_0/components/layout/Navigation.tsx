"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const platformLinks = [
  ["/dashboard", "Dashboard"],
  ["/session", "Session"],
  ["/training", "Training"],
  ["/memory-lab", "Memory"],
  ["/attention-lab", "Attention"],
  ["/logic-lab", "Logic"],
  ["/language-lab", "Language"],
  ["/visual-lab", "Visual"],
  ["/generator-lab", "Generator"],
  ["/coach", "Coach"],
  ["/progress", "Fortschritt"],
  ["/achievements", "Meilensteine"],
  ["/profile", "Profil & Daten"],
  ["/app-status", "App & Offline"],
  ["/settings", "Einstellungen"]
] as const;

function isCurrent(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function TopNavigation() {
  const pathname = usePathname();
  return <nav className="nav" aria-label="Hauptnavigation">
    {platformLinks.slice(0, 7).map(([href, label]) => <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>{label}</Link>)}
  </nav>;
}

export function SideNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Plattformbereiche">
    {platformLinks.map(([href, label]) => <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>{label}</Link>)}
  </nav>;
}
