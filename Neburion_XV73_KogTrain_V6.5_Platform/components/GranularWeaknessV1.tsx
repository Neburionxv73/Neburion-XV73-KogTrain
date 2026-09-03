"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./GranularWeaknessV1.module.css";

type RawStat={attempts?:number;correct?:number;sessions?:number;totalScore?:number};
type Insight={lab:string;skill:string;href:string;attempts:number;accuracy:number|null;priority:number;state:"focus"|"stable"|"strong"|"evidence"|"open"};

type Source={lab:string;href:string;key:string;kind:"modeStats"|"areaStats";labels:Record<string,string>};

const SOURCES:Source[]=[
 {lab:"Memory",href:"/training/memory",key:"neburion-v65-memory-progress",kind:"modeStats",labels:{digits:"Zahlen",reverse:"Rückwärts",words:"Wörter",symbols:"Symbole",positions:"Positionen",recognition:"Erkennen",nback1:"1-Back",nback2:"2-Back"}},
 {lab:"Attention",href:"/training/attention",key:"neburion-v65-attention-stats",kind:"modeStats",labels:{"go-no-go":"Go / No-Go","visual-search":"Visuelle Suche","rule-switch":"Regelwechsel",inhibition:"Hemmung",divided:"Geteilte Aufmerksamkeit",speed:"Tempo",interference:"Interferenz"}},
 {lab:"Logic",href:"/training/logic",key:"neburion-v65-logic-stats-v3",kind:"modeStats",labels:{sequence:"Zahlenfolgen",rule:"Regellogik",analogy:"Analogien",deduction:"Schlussfolgerungen",matrix:"Matrizen",operator:"Operatorlogik",exclusion:"Ausschluss",spatial:"Räumliche Logik"}},
 {lab:"Language",href:"/training/language",key:"neburion-v65-language-stats-v3",kind:"modeStats",labels:{synonym:"Synonyme",antonym:"Antonyme",analogy:"Analogien",category:"Kategorien",wordfield:"Wortfelder",sentence:"Satzlogik",relation:"Beziehungen",context:"Kontext"}},
 {lab:"Visual",href:"/training/visual",key:"neburion-v65-visual-stats",kind:"modeStats",labels:{rotation:"Rotation",mirror:"Spiegelung",pattern:"Musterreihe",matrix:"Matrix",position:"Positionswechsel",search:"Visuelle Suche",compare:"Formvergleich",memory:"Kurzzeitgedächtnis"}},
 {lab:"Gehirnfit",href:"/training/brain-fit",key:"neburion-v65-brain-fit-v372",kind:"areaStats",labels:{sudoku:"Tier-Sudoku",words:"Wortsuchraster",crossword:"Kreuzworträtsel",memory:"Memory",categories:"Kategorien",sequence:"Reihen & Folgen",everydayMath:"Alltagsrechnen",timeOrder:"Zeit & Reihenfolge"}},
];

function readJson(key:string):Record<string,unknown>{
 try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):{};}catch{return {};}
}

function stateFor(attempts:number,accuracy:number|null):Insight["state"]{
 if(attempts===0)return"open";
 if(attempts<4)return"evidence";
 if((accuracy??0)<65)return"focus";
 if((accuracy??0)>=88)return"strong";
 return"stable";
}

function priorityFor(attempts:number,accuracy:number|null){
 if(attempts===0)return 48;
 if(attempts<4)return 58-attempts*2;
 return Math.max(0,100-(accuracy??0))+Math.min(18,attempts);
}

function collect():Insight[]{
 const result:Insight[]=[];
 SOURCES.forEach(source=>{
  const data=readJson(source.key);
  const bucket=(data[source.kind]??{}) as Record<string,RawStat>;
  Object.entries(source.labels).forEach(([id,skill])=>{
   const stat=bucket[id]??{};
   const attempts=source.kind==="areaStats"?Number(stat.sessions??0):Number(stat.attempts??0);
   const correct=Number(stat.correct??0);
   const totalScore=Number(stat.totalScore??0);
   const accuracy=attempts>0?(source.kind==="areaStats"?Math.round(totalScore/attempts):Math.round(correct/attempts*100)):null;
   result.push({lab:source.lab,skill,href:source.href,attempts,accuracy,priority:priorityFor(attempts,accuracy),state:stateFor(attempts,accuracy)});
  });
 });
 return result;
}

const stateLabel:Record<Insight["state"],string>={focus:"Fokus",stable:"Stabil",strong:"Stark",evidence:"Mehr Evidenz",open:"Noch offen"};

export function GranularWeaknessV1(){
 const [items,setItems]=useState<Insight[]>([]);
 useEffect(()=>{const refresh=()=>setItems(collect());refresh();window.addEventListener("focus",refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener("focus",refresh);window.removeEventListener("storage",refresh);};},[]);
 const ranked=useMemo(()=>[...items].sort((a,b)=>b.priority-a.priority||a.attempts-b.attempts||a.skill.localeCompare(b.skill,"de")).slice(0,6),[items]);
 const measured=items.filter(item=>item.attempts>=4);
 const weakest=measured.filter(item=>item.state==="focus").sort((a,b)=>(a.accuracy??101)-(b.accuracy??101))[0];
 const strongest=measured.filter(item=>item.state==="strong").sort((a,b)=>(b.accuracy??0)-(a.accuracy??0))[0];
 const evidence=items.filter(item=>item.state==="evidence"||item.state==="open").length;

 return <section className={styles.shell} aria-labelledby="granular-title">
  <div className={styles.head}><div><span>Adaptive Analyse V1</span><h2 id="granular-title">Stärken und Schwächen nach Unterkategorie</h2><p>Die Auswertung trennt echte Schwächen von Bereichen mit zu wenig Evidenz. Priorisiert wird erst dann deutlich, wenn genügend Antworten gespeichert sind.</p></div><div className={styles.summary}><div><span>Fokus</span><strong>{weakest?`${weakest.skill} · ${weakest.accuracy}%`:"noch offen"}</strong></div><div><span>Stärke</span><strong>{strongest?`${strongest.skill} · ${strongest.accuracy}%`:"noch offen"}</strong></div><div><span>Evidenz offen</span><strong>{evidence}</strong></div></div></div>
  <div className={styles.grid}>{ranked.map(item=><Link href={item.href} className={styles.card} key={`${item.lab}-${item.skill}`} data-state={item.state}><div><span>{item.lab}</span><b>{stateLabel[item.state]}</b></div><h3>{item.skill}</h3><p>{item.attempts===0?"Noch keine gespeicherten Antworten. Dieser Bereich wird nicht als Schwäche bewertet.":item.attempts<4?`${item.attempts} Antwort${item.attempts===1?"":"en"} · zuerst weitere Evidenz sammeln.`:`${item.attempts} Antworten · ${item.accuracy}% Trefferquote.`}</p><div className={styles.track}><i style={{width:`${item.accuracy??0}%`}}/></div><small>{item.state==="focus"?"Gezielte Wiederholung empfohlen":item.state==="strong"?"Stabil halten":item.state==="stable"?"Weiter festigen":item.state==="evidence"?"Noch nicht belastbar":"Erst trainieren"} →</small></Link>)}</div>
 </section>;
}
