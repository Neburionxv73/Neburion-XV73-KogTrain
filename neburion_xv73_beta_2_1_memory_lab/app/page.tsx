import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
const modules=[
  ["🧠","Gedächtnis","Informationen aufnehmen, ordnen und sicher abrufen.",72],
  ["🎯","Aufmerksamkeit","Zielreize erkennen und Ablenkungen kontrollieren.",64],
  ["🔢","Mathematik","Rechenwege, Mengen und Alltagslogik trainieren.",58],
  ["🗣️","Sprache","Wortfindung, Verständnis und Ausdruck aktivieren.",69]
] as const;
export default function Home(){return <AppShell><section className="hero"><div className="container hero-grid"><div><span className="eyebrow">Beta 2.1 · Digital Cognitive Training System</span><h1>Trainiere klar. Entwickle dich bewusst.</h1><p className="lead">Neburion XV73 verbindet adaptive Übungen, nachvollziehbare Empfehlungen und eine warme, konzentrierte Benutzeroberfläche zu einem persönlichen Lernsystem.</p><div className="actions"><Button href="/dashboard">Dashboard öffnen</Button><Button href="/memory-lab" secondary>Memory Lab öffnen</Button></div></div><div className="hero-card"><div className="brain-core"/><div className="mini-grid"><div className="metric"><strong>4</strong><span>Engine-Bereiche</span></div><div className="metric"><strong>5</strong><span>Trainingsdomänen</span></div><div className="metric"><strong>100%</strong><span>lokale Kontrolle</span></div></div></div></div></section><section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Trainingswelt</span><h2>Ein System, mehrere Fähigkeiten.</h2></div></div><div className="grid">{modules.map(([icon,title,text,progress])=><ModuleCard key={title} icon={icon} title={title} text={text} progress={progress}/>)}</div></div></section></AppShell>}
