"use client";

import { useMemo, useState } from "react";
import type { Difficulty, TrainingResult } from "@/features/cognitive-engine/types";
import { saveResult } from "@/features/progress-engine/storage";

type VisualMode = "Formen" | "Spiegelung" | "Rotation" | "Räumliche Reihen" | "Perspektive";
type VisualTask = {
  id: string;
  mode: VisualMode;
  title: string;
  instruction: string;
  prompt: string;
  answer: string;
  options: string[];
  explanation: string;
  accent: "aqua" | "violet" | "amber" | "rose" | "mint";
};

const levels: { value: Difficulty; label: string; copy: string }[] = [
  { value: "einstieg", label: "Einstieg", copy: "Große Formen und klare Unterschiede." },
  { value: "leicht", label: "Leicht", copy: "Einfache Drehungen und Spiegelungen." },
  { value: "mittel", label: "Mittel", copy: "Mehrere Merkmale gleichzeitig vergleichen." },
  { value: "schwer", label: "Schwer", copy: "Komplexere räumliche Regeln erkennen." },
  { value: "profi", label: "Profi", copy: "Feine Unterschiede unter hoher Ähnlichkeit." }
];

const modes: { key: VisualMode; icon: string; copy: string }[] = [
  { key: "Formen", icon: "◆", copy: "Konturen und Details unterscheiden" },
  { key: "Spiegelung", icon: "◐", copy: "Achsen und Seitenwechsel erfassen" },
  { key: "Rotation", icon: "↻", copy: "Gedrehte Objekte mental vergleichen" },
  { key: "Räumliche Reihen", icon: "⟲", copy: "Visuelle Veränderungen fortsetzen" },
  { key: "Perspektive", icon: "◈", copy: "Positionen und Blickrichtungen verstehen" }
];

const tasks: Record<Difficulty, VisualTask[]> = {
  einstieg: [
    { id:"vi-e-1", mode:"Formen", title:"Formeninsel", instruction:"Welche Form unterscheidet sich?", prompt:"Kreis · Kreis · Quadrat · Kreis", options:["1","2","3","4"], answer:"3", explanation:"An Position 3 steht als einzige Form ein Quadrat.", accent:"aqua" },
    { id:"vi-e-2", mode:"Spiegelung", title:"Spiegelachse", instruction:"Welche Richtung entsteht im Spiegel?", prompt:"Pfeil nach rechts →", options:["←","→","↑","↓"], answer:"←", explanation:"Eine vertikale Spiegelung kehrt rechts und links um.", accent:"violet" },
    { id:"vi-e-3", mode:"Rotation", title:"Sanfte Drehung", instruction:"Wie sieht der Pfeil nach einer Vierteldrehung im Uhrzeigersinn aus?", prompt:"↑", options:["→","←","↓","↑"], answer:"→", explanation:"Eine Vierteldrehung im Uhrzeigersinn führt von oben nach rechts.", accent:"amber" },
    { id:"vi-e-4", mode:"Räumliche Reihen", title:"Formenfluss", instruction:"Welche Form setzt die Reihe fort?", prompt:"○  □  ○  □  ?", options:["○","□","△","◇"], answer:"○", explanation:"Kreis und Quadrat wechseln sich ab.", accent:"rose" },
    { id:"vi-e-5", mode:"Perspektive", title:"Position im Raum", instruction:"Welches Objekt liegt oben?", prompt:"△ über ○", options:["△","○","beide","keines"], answer:"△", explanation:"Das Dreieck befindet sich oberhalb des Kreises.", accent:"mint" }
  ],
  leicht: [
    { id:"vi-l-1", mode:"Formen", title:"Konturvergleich", instruction:"Welche Form besitzt eine Ecke mehr?", prompt:"Dreieck · Quadrat · Dreieck · Dreieck", options:["1","2","3","4"], answer:"2", explanation:"Das Quadrat hat vier Ecken, die Dreiecke jeweils drei.", accent:"aqua" },
    { id:"vi-l-2", mode:"Spiegelung", title:"Seitentausch", instruction:"Welche Darstellung ist die korrekte Spiegelung?", prompt:"◢", options:["◣","◢","◤","◥"], answer:"◣", explanation:"Bei der vertikalen Spiegelung wechselt die gefüllte Ecke von rechts nach links.", accent:"violet" },
    { id:"vi-l-3", mode:"Rotation", title:"Halbe Drehung", instruction:"Wie sieht die Form nach 180° aus?", prompt:"↗", options:["↙","↘","↖","↗"], answer:"↙", explanation:"Eine halbe Drehung kehrt die Richtung vollständig um.", accent:"amber" },
    { id:"vi-l-4", mode:"Räumliche Reihen", title:"Drehimpuls", instruction:"Welche Richtung folgt?", prompt:"↑  →  ↓  ?", options:["←","↑","→","↓"], answer:"←", explanation:"Der Pfeil dreht sich jeweils um 90° im Uhrzeigersinn.", accent:"rose" },
    { id:"vi-l-5", mode:"Perspektive", title:"Links und rechts", instruction:"A steht links von B. Wo steht B?", prompt:"A  ·  B", options:["rechts von A","links von A","über A","unter A"], answer:"rechts von A", explanation:"Wenn A links von B steht, befindet sich B rechts von A.", accent:"mint" }
  ],
  mittel: [
    { id:"vi-m-1", mode:"Formen", title:"Merkmalsfilter", instruction:"Welche Form ist weder rund noch geschlossen?", prompt:"○  ◇  C  □", options:["○","◇","C","□"], answer:"C", explanation:"C ist offen und besitzt keine vollständig geschlossene Kontur.", accent:"aqua" },
    { id:"vi-m-2", mode:"Spiegelung", title:"Doppelmerkmal", instruction:"Welche Option spiegelt Form und Punkt korrekt?", prompt:"◁•", options:["•▷","▷•","•◁","◁•"], answer:"•▷", explanation:"Formrichtung und Punktposition wechseln gemeinsam die Seite.", accent:"violet" },
    { id:"vi-m-3", mode:"Rotation", title:"Dreivierteldrehung", instruction:"Wie steht der Pfeil nach 270° im Uhrzeigersinn?", prompt:"↑", options:["←","→","↓","↑"], answer:"←", explanation:"270° im Uhrzeigersinn entsprechen einer Vierteldrehung gegen den Uhrzeigersinn.", accent:"amber" },
    { id:"vi-m-4", mode:"Räumliche Reihen", title:"Zwei Regeln", instruction:"Welche Kombination folgt?", prompt:"○ klein · □ groß · ○ klein · ?", options:["□ groß","□ klein","○ groß","○ klein"], answer:"□ groß", explanation:"Form und Größe wechseln in einem festen Zweierschritt.", accent:"rose" },
    { id:"vi-m-5", mode:"Perspektive", title:"Dreierbeziehung", instruction:"A liegt über B, B liegt links von C. Wo liegt A relativ zu C?", prompt:"A ↑ B ← C", options:["oben links","oben rechts","unten links","unten rechts"], answer:"oben links", explanation:"A liegt über B und B links von C; damit liegt A oben links von C.", accent:"mint" }
  ],
  schwer: [
    { id:"vi-s-1", mode:"Formen", title:"Feine Abweichung", instruction:"Welche Figur weicht in Orientierung und Füllung ab?", prompt:"◐  ◐  ◑  ◐", options:["1","2","3","4"], answer:"3", explanation:"Nur die dritte Form ist auf der gegenüberliegenden Seite gefüllt.", accent:"aqua" },
    { id:"vi-s-2", mode:"Spiegelung", title:"Achsenwechsel", instruction:"Welche Form entsteht bei horizontaler Spiegelung?", prompt:"◤", options:["◣","◥","◤","◢"], answer:"◣", explanation:"Eine horizontale Spiegelung tauscht oben und unten, nicht links und rechts.", accent:"violet" },
    { id:"vi-s-3", mode:"Rotation", title:"Kombinierte Drehung", instruction:"Ein Pfeil zeigt nach rechts, wird 90° gegen und danach 180° im Uhrzeigersinn gedreht. Wohin zeigt er?", prompt:"→", options:["↓","↑","←","→"], answer:"↓", explanation:"Rechts wird zuerst oben, danach durch 180° zu unten.", accent:"amber" },
    { id:"vi-s-4", mode:"Räumliche Reihen", title:"Form-Farbe-Rhythmus", instruction:"Welche Kombination folgt logisch?", prompt:"●  □  ○  ■  ●  ?", options:["□","○","■","●"], answer:"□", explanation:"Die Form wechselt Kreis/Quadrat, die Füllung folgt gefüllt, leer, leer, gefüllt.", accent:"rose" },
    { id:"vi-s-5", mode:"Perspektive", title:"Mentale Karte", instruction:"Du gehst nach Norden, drehst rechts, dann links. In welche Richtung blickst du?", prompt:"Norden → rechts → links", options:["Norden","Osten","Süden","Westen"], answer:"Norden", explanation:"Rechts führt nach Osten, links anschließend wieder nach Norden.", accent:"mint" }
  ],
  profi: [
    { id:"vi-p-1", mode:"Formen", title:"Mikrovariation", instruction:"Welche Figur unterscheidet sich nur durch die innere Orientierung?", prompt:"◇↗  ◇↗  ◇↖  ◇↗", options:["1","2","3","4"], answer:"3", explanation:"Die Außenform bleibt gleich; nur der innere Pfeil zeigt bei Position 3 nach links oben.", accent:"aqua" },
    { id:"vi-p-2", mode:"Spiegelung", title:"Mehrfachspiegelung", instruction:"Eine Form wird erst vertikal, dann horizontal gespiegelt. Welcher Effekt entspricht dem?", prompt:"↗", options:["↙","↘","↖","↗"], answer:"↙", explanation:"Zwei rechtwinklige Spiegelungen entsprechen einer Drehung um 180°.", accent:"violet" },
    { id:"vi-p-3", mode:"Rotation", title:"Rotationskomposition", instruction:"Ein Symbol wird 90° im Uhrzeigersinn, 270° gegen den Uhrzeigersinn und 180° im Uhrzeigersinn gedreht. Ergebnis?", prompt:"↑", options:["↑","→","↓","←"], answer:"↑", explanation:"90° im Uhrzeigersinn, 270° gegen den Uhrzeigersinn und 180° im Uhrzeigersinn ergeben zusammen 0°. Der Pfeil bleibt oben.", accent:"amber" },
    { id:"vi-p-4", mode:"Räumliche Reihen", title:"Dreifache Regel", instruction:"Welche Figur folgt?", prompt:"○ klein leer · □ groß gefüllt · △ klein leer · ○ groß gefüllt · ?", options:["□ klein leer","□ groß leer","△ klein gefüllt","○ klein leer"], answer:"□ klein leer", explanation:"Formen laufen Kreis, Quadrat, Dreieck; Größe und Füllung wechseln jeweils.", accent:"rose" },
    { id:"vi-p-5", mode:"Perspektive", title:"Raumfolge", instruction:"A ist nördlich von B. C ist östlich von A. D ist südlich von C. Wo liegt D relativ zu B?", prompt:"B → A → C → D", options:["östlich","westlich","nördlich","südlich"], answer:"östlich", explanation:"A liegt über B, C rechts von A und D unter C. Damit liegt D rechts von B.", accent:"mint" }
  ]
};

function makeId(){return typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():`visual-${Date.now()}`}

export function VisualLab(){
  const [difficulty,setDifficulty]=useState<Difficulty>("leicht");
  const [mode,setMode]=useState<VisualMode>("Formen");
  const [selected,setSelected]=useState<string|null>(null);
  const [startedAt,setStartedAt]=useState(Date.now());
  const task=useMemo(()=>tasks[difficulty].find(item=>item.mode===mode)!,[difficulty,mode]);
  const correct=selected===task.answer;
  function reset(nextDifficulty=difficulty,nextMode=mode){setDifficulty(nextDifficulty);setMode(nextMode);setSelected(null);setStartedAt(Date.now())}
  function choose(option:string){
    if(selected)return;
    setSelected(option);
    const result:TrainingResult={id:makeId(),domain:"visuell",difficulty,score:option===task.answer?100:35,durationSeconds:Math.max(1,Math.round((Date.now()-startedAt)/1000)),createdAt:new Date().toISOString(),exerciseId:task.id,exerciseType:"visual-scene",category:mode};
    saveResult(result);
  }
  return <>
    <section className="panel visual-hero">
      <div><span className="eyebrow">Visual Lab 1.0 · Spatial Experience</span><h1>Sehen wird zu räumlichem Denken.</h1><p className="lead">Formen, Spiegelungen und Perspektiven erscheinen als hochwertige Denkobjekte mit klarer Tiefe, ruhiger Bewegung und präzisem Feedback.</p></div>
      <div className="visual-sculpture" aria-hidden="true"><span>◆</span><span>◐</span><span>↻</span><b>VISUAL</b></div>
    </section>

    <section className="panel visual-controls">
      <span className="eyebrow">Schwierigkeitsgrad</span>
      <div className="difficulty-row">{levels.map(level=><button key={level.value} className={difficulty===level.value?"is-active":""} onClick={()=>reset(level.value,mode)}><strong>{level.label}</strong><small>{level.copy}</small></button>)}</div>
      <span className="eyebrow visual-mode-label">Trainingswelt</span>
      <div className="visual-mode-grid">{modes.map(item=><button key={item.key} className={`visual-mode-card ${mode===item.key?"is-active":""}`} onClick={()=>reset(difficulty,item.key)}><i>{item.icon}</i><strong>{item.key}</strong><span>{item.copy}</span></button>)}</div>
    </section>

    <section className={`visual-stage visual-${task.accent}`}>
      <div className="visual-stage-head"><div><span className="eyebrow">{task.mode} · {difficulty}</span><h2>{task.title}</h2><p>{task.instruction}</p></div><span className="visual-focus-badge">Fokus · Raum · Vergleich</span></div>
      <div className="visual-progress"><span /></div>
      <div className="visual-prompt"><small>VISUELLE SZENE</small><strong>{task.prompt}</strong></div>
      <div className="visual-options">{task.options.map(option=><button key={option} disabled={!!selected} onClick={()=>choose(option)} className={selected===option?(option===task.answer?"is-correct":"is-wrong"):selected&&option===task.answer?"is-correct":""}>{option}</button>)}</div>
      {selected&&<div className={`visual-feedback ${correct?"is-correct":"is-wrong"}`}><span>{correct?"✓":"↺"}</span><div><strong>{correct?"Räumlich richtig erkannt":"Die visuelle Regel liegt knapp daneben"}</strong><p>{task.explanation}</p></div></div>}
      <div className="visual-actions"><span>Die Szene bleibt bewusst ruhig, damit Vergleich und Orientierung im Vordergrund stehen.</span><button className="btn btn-primary" onClick={()=>reset()}>{selected?"Neue Variante":"Szene neu starten"}</button></div>
    </section>
  </>;
}
