"use client";

import { useMemo, useState } from "react";
import type { Difficulty, TrainingResult } from "@/features/cognitive-engine/types";
import { saveResult } from "@/features/progress-engine/storage";

type LogicMode = "Muster" | "Zahlenreihen" | "Regelwechsel" | "Schlussfolgern";
type LogicTask = {
  id: string;
  mode: LogicMode;
  title: string;
  instruction: string;
  sequence?: string[];
  prompt?: string;
  options: string[];
  answer: string;
  explanation: string;
  accent: "amber" | "violet" | "teal" | "rose";
};

const levels: { value: Difficulty; label: string; copy: string }[] = [
  { value: "einstieg", label: "Einstieg", copy: "Klare Regeln und starke visuelle Hinweise." },
  { value: "leicht", label: "Leicht", copy: "Kurze Reihen mit gut erkennbaren Veränderungen." },
  { value: "mittel", label: "Mittel", copy: "Mehrschrittige Regeln und ähnliche Optionen." },
  { value: "schwer", label: "Schwer", copy: "Verdeckte Muster und kombinierte Beziehungen." },
  { value: "profi", label: "Profi", copy: "Komplexe Wechselregeln und abstrakte Schlüsse." }
];

const modes: { key: LogicMode; icon: string; copy: string }[] = [
  { key: "Muster", icon: "◇", copy: "Formen, Rhythmus und visuelle Ordnung" },
  { key: "Zahlenreihen", icon: "∑", copy: "Abstände, Sprünge und Rechenregeln" },
  { key: "Regelwechsel", icon: "⇄", copy: "Zwei Regeln gleichzeitig verfolgen" },
  { key: "Schlussfolgern", icon: "∴", copy: "Aussagen prüfen und logisch ableiten" }
];

const library: Record<Difficulty, LogicTask[]> = {
  einstieg: [
    { id:"l-e-1", mode:"Muster", title:"Ruhiger Formenrhythmus", instruction:"Welche Form setzt den Rhythmus fort?", sequence:["●","▲","●","▲","●","?"], options:["▲","■","●","◆"], answer:"▲", explanation:"Kreis und Dreieck wechseln sich regelmäßig ab.", accent:"amber" },
    { id:"l-e-2", mode:"Zahlenreihen", title:"Gleichmäßiger Schritt", instruction:"Welche Zahl folgt als Nächstes?", sequence:["2","4","6","8","?"], options:["9","10","11","12"], answer:"10", explanation:"Jeder Schritt erhöht die Zahl um 2.", accent:"teal" },
    { id:"l-e-3", mode:"Regelwechsel", title:"Farbe und Form", instruction:"Welche Karte passt als Nächstes?", sequence:["roter Kreis","blaues Quadrat","roter Kreis","blaues Quadrat","?"], options:["roter Kreis","rotes Quadrat","blauer Kreis","grünes Quadrat"], answer:"roter Kreis", explanation:"Die beiden Karten wechseln sich unverändert ab.", accent:"violet" },
    { id:"l-e-4", mode:"Schlussfolgern", title:"Sicherer Schluss", instruction:"Welche Aussage ist zwingend richtig?", prompt:"Alle Birken sind Bäume. Diese Pflanze ist eine Birke.", options:["Sie ist ein Baum.","Sie trägt Früchte.","Sie ist sehr alt.","Sie wächst im Wald."], answer:"Sie ist ein Baum.", explanation:"Die Eigenschaft Baum gilt für jede Birke.", accent:"rose" }
  ],
  leicht: [
    { id:"l-l-1", mode:"Muster", title:"Wachsende Formfolge", instruction:"Welche Form vervollständigt die Reihe?", sequence:["●","●●","●●●","?"], options:["●●","●●●●","▲▲▲▲","●●●●●"], answer:"●●●●", explanation:"In jedem Schritt kommt genau ein Kreis dazu.", accent:"amber" },
    { id:"l-l-2", mode:"Zahlenreihen", title:"Dreiersprünge", instruction:"Finde die nächste Zahl.", sequence:["5","8","11","14","?"], options:["15","16","17","18"], answer:"17", explanation:"Die Reihe wächst jeweils um 3.", accent:"teal" },
    { id:"l-l-3", mode:"Regelwechsel", title:"Zwei Takte", instruction:"Welche Zahl folgt?", sequence:["2","5","4","7","6","?"], options:["8","9","10","11"], answer:"9", explanation:"Die Reihe wechselt zwischen +3 und −1.", accent:"violet" },
    { id:"l-l-4", mode:"Schlussfolgern", title:"Kategorie erkennen", instruction:"Welche Aussage folgt logisch?", prompt:"Kein Quadrat ist ein Kreis. Form A ist ein Quadrat.", options:["A ist kein Kreis.","A ist blau.","A ist groß.","A ist ein Dreieck."], answer:"A ist kein Kreis.", explanation:"Ein Quadrat kann nach der Vorgabe kein Kreis sein.", accent:"rose" }
  ],
  mittel: [
    { id:"l-m-1", mode:"Muster", title:"Drehung im Raum", instruction:"Welche Orientierung folgt?", sequence:["↑","→","↓","←","?"], options:["↑","↗","→","↓"], answer:"↑", explanation:"Der Pfeil dreht sich immer um 90 Grad im Uhrzeigersinn.", accent:"amber" },
    { id:"l-m-2", mode:"Zahlenreihen", title:"Verdoppeln und ergänzen", instruction:"Welche Zahl setzt die Regel fort?", sequence:["3","7","15","31","?"], options:["47","61","63","64"], answer:"63", explanation:"Jede Zahl wird verdoppelt und anschließend um 1 erhöht.", accent:"teal" },
    { id:"l-m-3", mode:"Regelwechsel", title:"Alternierende Abstände", instruction:"Welche Zahl fehlt?", sequence:["4","9","7","12","10","?"], options:["13","14","15","16"], answer:"15", explanation:"Die Schritte wechseln zwischen +5 und −2.", accent:"violet" },
    { id:"l-m-4", mode:"Schlussfolgern", title:"Bedingungen verbinden", instruction:"Welche Aussage ist sicher?", prompt:"Alle Mitglieder des Teams tragen ein Abzeichen. Lea trägt kein Abzeichen.", options:["Lea ist nicht im Team.","Lea leitet das Team.","Lea hat es verloren.","Lea ist neu."], answer:"Lea ist nicht im Team.", explanation:"Wer im Team ist, trägt zwingend ein Abzeichen.", accent:"rose" }
  ],
  schwer: [
    { id:"l-s-1", mode:"Muster", title:"Doppelte Transformation", instruction:"Welche Kachel folgt?", sequence:["▲1","■2","▲3","■4","?"], options:["▲5","■5","▲6","◆5"], answer:"▲5", explanation:"Die Form wechselt, während die Zahl jeweils um 1 steigt.", accent:"amber" },
    { id:"l-s-2", mode:"Zahlenreihen", title:"Quadratische Abstände", instruction:"Finde die nächste Zahl.", sequence:["2","5","10","17","26","?"], options:["35","36","37","38"], answer:"37", explanation:"Die Abstände sind 3, 5, 7, 9 und danach 11.", accent:"teal" },
    { id:"l-s-3", mode:"Regelwechsel", title:"Spiegelnde Operation", instruction:"Welche Zahl setzt die Folge fort?", sequence:["6","12","9","18","15","?"], options:["21","27","30","33"], answer:"30", explanation:"Die Schritte wechseln zwischen ×2 und −3.", accent:"violet" },
    { id:"l-s-4", mode:"Schlussfolgern", title:"Ausschlusslogik", instruction:"Welche Aussage muss stimmen?", prompt:"Ein Objekt ist entweder golden oder silbern, niemals beides. Objekt X ist nicht silbern.", options:["X ist golden.","X ist aus Metall.","X ist wertvoll.","X ist leicht."], answer:"X ist golden.", explanation:"Da genau eine der beiden Eigenschaften gilt, bleibt nur golden.", accent:"rose" }
  ],
  profi: [
    { id:"l-p-1", mode:"Muster", title:"Verschachtelter Rhythmus", instruction:"Welche Einheit vervollständigt die Struktur?", sequence:["●▲","▲■","■◆","◆●","?"], options:["●▲","▲●","◆■","■▲"], answer:"●▲", explanation:"Jede Einheit übernimmt die zweite Form der vorherigen und ergänzt die nächste Form im Zyklus.", accent:"amber" },
    { id:"l-p-2", mode:"Zahlenreihen", title:"Rekursive Folge", instruction:"Welche Zahl folgt?", sequence:["1","2","4","7","11","16","?"], options:["20","21","22","23"], answer:"22", explanation:"Die Abstände steigen fortlaufend: +1, +2, +3, +4, +5, danach +6.", accent:"teal" },
    { id:"l-p-3", mode:"Regelwechsel", title:"Dreifache Regelspur", instruction:"Welche Zahl setzt die Folge fort?", sequence:["3","9","8","24","23","69","?"], options:["68","70","72","207"], answer:"68", explanation:"Die Operationen wechseln zwischen ×3 und −1.", accent:"violet" },
    { id:"l-p-4", mode:"Schlussfolgern", title:"Mehrstufige Deduktion", instruction:"Welche Aussage folgt zwingend?", prompt:"Alle R sind S. Kein S ist T. Einige U sind R.", options:["Einige U sind nicht T.","Alle U sind S.","Kein U ist T.","Einige T sind R."], answer:"Einige U sind nicht T.", explanation:"Einige U sind R, damit S, und kein S kann T sein.", accent:"rose" }
  ]
};

function makeId(){return typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():`logic-${Date.now()}`}

export function LogicLab(){
  const [difficulty,setDifficulty]=useState<Difficulty>("leicht");
  const [mode,setMode]=useState<LogicMode>("Muster");
  const [round,setRound]=useState(0);
  const [selected,setSelected]=useState<string | null>(null);
  const [scores,setScores]=useState<number[]>([]);
  const [finished,setFinished]=useState(false);
  const [startedAt,setStartedAt]=useState(Date.now());
  const tasks=useMemo(()=>library[difficulty].filter(task=>task.mode===mode),[difficulty,mode]);
  const task=tasks[round%tasks.length];
  const isCorrect=selected===task.answer;

  function reset(nextDifficulty=difficulty,nextMode=mode){setDifficulty(nextDifficulty);setMode(nextMode);setRound(0);setSelected(null);setScores([]);setFinished(false);setStartedAt(Date.now())}
  function submit(option:string){if(selected)return;setSelected(option);const score=option===task.answer?100:35;setScores(v=>[...v,score]);const result:TrainingResult={id:makeId(),domain:"logik",difficulty,score,durationSeconds:Math.max(1,Math.round((Date.now()-startedAt)/1000)),createdAt:new Date().toISOString(),exerciseId:task.id,exerciseType:"logic-scene",category:mode};saveResult(result)}
  function next(){setFinished(true)}
  const average=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;

  return <>
    <section className="panel logic-hero">
      <div><span className="eyebrow">Logic Lab 1.0 · Motivational Experience</span><h1>Denken darf sich gut anfühlen.</h1><p className="lead">Vier visuell eigenständige Trainingswelten verbinden klare Logik mit hochwertiger Gestaltung, ruhiger Tiefe und verständlichem Feedback.</p></div>
      <div className="logic-orbit" aria-hidden="true"><span>◇</span><span>∑</span><span>⇄</span><span>∴</span><b>LOGIC</b></div>
    </section>

    <section className="panel logic-controls">
      <span className="eyebrow">Schwierigkeitsgrad</span>
      <div className="difficulty-grid">{levels.map(level=><button key={level.value} className={`difficulty-card ${difficulty===level.value?"is-active":""}`} onClick={()=>reset(level.value,mode)}><strong>{level.label}</strong><span>{level.copy}</span></button>)}</div>
      <span className="eyebrow logic-mode-label">Trainingswelt</span>
      <div className="logic-mode-grid">{modes.map(item=><button key={item.key} className={`logic-mode-card ${mode===item.key?"is-active":""}`} onClick={()=>reset(difficulty,item.key)}><i>{item.icon}</i><strong>{item.key}</strong><span>{item.copy}</span></button>)}</div>
    </section>

    {finished?<section className="panel logic-summary"><span className="eyebrow">Training abgeschlossen</span><div className="logic-score-ring"><strong>{average}%</strong><span>Gesamtleistung</span></div><h2>Klare Arbeit. Gute Spur.</h2><p>{average>=85?"Du hast die Regeln sehr sicher erkannt.":average>=60?"Die Grundlogik sitzt. Ein weiterer Durchgang festigt die Wechselregeln.":"Nimm dir beim nächsten Mal mehr Zeit und suche zuerst nach dem kleinsten wiederkehrenden Unterschied."}</p><button className="btn btn-primary" onClick={()=>reset()}>Neue Session starten</button></section>:
    <section className={`logic-stage logic-accent-${task.accent}`}>
      <div className="logic-stage-head"><div><span className="eyebrow">{mode} · {difficulty}</span><h2>{task.title}</h2><p>{task.instruction}</p></div><div className="runner-counter">1 / 1</div></div>
      <div className="logic-progress"><span style={{width:`${selected?100:0}%`}}/></div>
      {task.prompt&&<div className="logic-prompt">{task.prompt}</div>}
      {task.sequence&&<div className="logic-sequence" aria-label="Logische Folge">{task.sequence.map((item,index)=><span key={`${item}-${index}`} className={item==="?"?"is-question":""}>{item}</span>)}</div>}
      <div className="logic-options">{task.options.map(option=><button key={option} disabled={!!selected} className={`${selected===option?"is-selected":""} ${selected&&option===task.answer?"is-correct":""} ${selected===option&&!isCorrect?"is-wrong":""}`} onClick={()=>submit(option)}>{option}</button>)}</div>
      {selected&&<div className={`logic-feedback ${isCorrect?"is-correct":"is-wrong"}`}><div className="feedback-mark">{isCorrect?"✓":"↺"}</div><div><strong>{isCorrect?"Regel erkannt":"Fast – Regel neu lesen"}</strong><p>{task.explanation}</p></div></div>}
      <div className="logic-actions"><span>{selected?"Erklärung geprüft":"Wähle die logisch passende Antwort"}</span>{selected&&<button className="btn btn-primary" onClick={next}>Auswertung öffnen</button>}</div>
    </section>}
  </>;
}
