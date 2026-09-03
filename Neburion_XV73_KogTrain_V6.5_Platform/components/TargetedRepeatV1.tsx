"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./TargetedRepeatV1.module.css";

type RawStat={attempts?:number;correct?:number;sessions?:number;totalScore?:number};
type RepeatItem={lab:string;mode:string;skill:string;href:string;attempts:number;accuracy:number;priority:number};
type Source={lab:string;href:string;key:string;kind:"modeStats"|"areaStats";labels:Record<string,string>};

const SOURCES:Source[]=[
 {lab:"Memory",href:"/training/memory",key:"neburion-v65-memory-progress",kind:"modeStats",labels:{digits:"Zahlen",reverse:"Rückwärts",words:"Wörter",symbols:"Symbole",positions:"Positionen",recognition:"Erkennen",nback1:"1-Back",nback2:"2-Back"}},
 {lab:"Attention",href:"/training/attention",key:"neburion-v65-attention-stats",kind:"modeStats",labels:{"go-no-go":"Go / No-Go","visual-search":"Visuelle Suche","rule-switch":"Regelwechsel",inhibition:"Hemmung",divided:"Geteilte Aufmerksamkeit",speed:"Tempo",interference:"Interferenz"}},
 {lab:"Logic",href:"/training/logic",key:"neburion-v65-logic-stats-v3",kind:"modeStats",labels:{sequence:"Zahlenfolgen",rule:"Regellogik",analogy:"Analogien",deduction:"Schlussfolgerungen",matrix:"Matrizen",operator:"Operatorlogik",exclusion:"Ausschluss",spatial:"Räumliche Logik"}},
 {lab:"Language",href:"/training/language",key:"neburion-v65-language-stats-v3",kind:"modeStats",labels:{synonym:"Synonyme",antonym:"Antonyme",analogy:"Analogien",category:"Kategorien",wordfield:"Wortfelder",sentence:"Satzlogik",relation:"Beziehungen",context:"Kontext"}},
 {lab:"Visual",href:"/training/visual",key:"neburion-v65-visual-stats",kind:"modeStats",labels:{rotation:"Rotation",mirror:"Spiegelung",pattern:"Musterreihe",matrix:"Matrix",position:"Positionswechsel",search:"Visuelle Suche",compare:"Formvergleich",memory:"Kurzzeitgedächtnis"}},
 {lab:"Gehirnfit",href:"/training/brain-fit",key:"neburion-v65-brain-fit-v372",kind:"areaStats",labels:{sudoku:"Tier-Sudoku",words:"Wortsuchraster",crossword:"Kreuzworträtsel",memory:"Memory",categories:"Kategorien",sequence:"Reihen & Folgen",everydayMath:"Alltagsrechnen",timeOrder:"Zeit & Reihenfolge"}},
];

function readJson(key:string):Record<string,unknown>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):{};}catch{return {};}}

function collect():RepeatItem[]{
 const out:RepeatItem[]=[];
 for(const source of SOURCES){
  const data=readJson(source.key);
  const bucket=(data[source.kind]??{}) as Record<string,RawStat>;
  for(const [mode,skill] of Object.entries(source.labels)){
   const stat=bucket[mode]??{};
   const attempts=source.kind==="areaStats"?Number(stat.sessions??0):Number(stat.attempts??0);
   if(attempts<4)continue;
   const accuracy=source.kind==="areaStats"?Math.round(Number(stat.totalScore??0)/attempts):Math.round(Number(stat.correct??0)/attempts*100);
   if(accuracy>=75)continue;
   const priority=Math.round((100-accuracy)*1.4+Math.min(20,attempts));
   out.push({lab:source.lab,mode,skill,href:source.href,attempts,accuracy,priority});
  }
 }
 return out.sort((a,b)=>b.priority-a.priority||a.accuracy-b.accuracy||b.attempts-a.attempts);
}

export function TargetedRepeatV1(){
 const [items,setItems]=useState<RepeatItem[]>([]);
 useEffect(()=>{const refresh=()=>setItems(collect());refresh();window.addEventListener("focus",refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener("focus",refresh);window.removeEventListener("storage",refresh);};},[]);
 const plan=useMemo(()=>items.slice(0,3),[items]);
 const totalEvidence=useMemo(()=>plan.reduce((sum,item)=>sum+item.attempts,0),[plan]);

 return <section className={styles.shell} aria-labelledby="repeat-title">
  <div className={styles.head}>
   <div><span>Gezielte Wiederholung · V1</span><h2 id="repeat-title">Trainiere zuerst, was dich aktuell am meisten bremst.</h2><p>Der Wiederholungsplan verwendet nur Unterkategorien mit mindestens vier gespeicherten Antworten. Bereiche ohne belastbare Evidenz werden nicht als Schwäche behandelt.</p></div>
   <div className={styles.badge}><span>Plan</span><strong>{plan.length?`${plan.length} Fokusbereiche`:"noch offen"}</strong><small>{plan.length?`${totalEvidence} Antworten als Evidenz`:"Zuerst weiter trainieren"}</small></div>
  </div>
  {plan.length?<div className={styles.grid}>{plan.map((item,index)=><article className={styles.card} key={`${item.lab}-${item.mode}`}>
    <div className={styles.rank}>0{index+1}</div><div className={styles.copy}><span>{item.lab}</span><h3>{item.skill}</h3><p>{item.accuracy}% Trefferquote aus {item.attempts} Antworten. Dieser Bereich bekommt im nächsten Wiederholungsblock Priorität.</p><div className={styles.track}><i style={{width:`${item.accuracy}%`}}/></div></div>
    <Link href={`${item.href}?focus=${encodeURIComponent(item.mode)}&repeat=1`} className={styles.action}>Fokus öffnen →</Link>
   </article>)}</div>:<div className={styles.empty}><strong>Noch kein belastbarer Schwächen-Fokus.</strong><p>Sobald eine Unterkategorie mindestens vier Antworten gesammelt hat und unter 75% liegt, erscheint sie automatisch in diesem Plan.</p></div>}
 </section>;
}
