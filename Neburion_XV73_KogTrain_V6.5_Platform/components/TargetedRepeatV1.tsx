"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePlatformLanguage } from "./PlatformLanguageProvider";
import styles from "./TargetedRepeatV1.module.css";

type RawStat={attempts?:number;correct?:number;sessions?:number;totalScore?:number};
type RepeatItem={lab:string;mode:string;skill:string;href:string;attempts:number;accuracy:number;priority:number};
type Source={lab:string;href:string;key:string;kind:"modeStats"|"areaStats";labels:Record<string,{de:string;en:string}>};

const SOURCES:Source[]=[
 {lab:"Memory",href:"/training/memory",key:"neburion-v65-memory-progress",kind:"modeStats",labels:{digits:{de:"Zahlen",en:"Digits"},reverse:{de:"Rückwärts",en:"Reverse recall"},words:{de:"Wörter",en:"Words"},symbols:{de:"Symbole",en:"Symbols"},positions:{de:"Positionen",en:"Positions"},recognition:{de:"Erkennen",en:"Recognition"},nback1:{de:"1-Back",en:"1-Back"},nback2:{de:"2-Back",en:"2-Back"}}},
 {lab:"Attention",href:"/training/attention",key:"neburion-v65-attention-stats",kind:"modeStats",labels:{"go-no-go":{de:"Go / No-Go",en:"Go / No-Go"},"visual-search":{de:"Visuelle Suche",en:"Visual search"},"rule-switch":{de:"Regelwechsel",en:"Rule switching"},inhibition:{de:"Hemmung",en:"Inhibition"},divided:{de:"Geteilte Aufmerksamkeit",en:"Divided attention"},speed:{de:"Tempo",en:"Speed"},interference:{de:"Interferenz",en:"Interference"}}},
 {lab:"Logic",href:"/training/logic",key:"neburion-v65-logic-stats-v3",kind:"modeStats",labels:{sequence:{de:"Zahlenfolgen",en:"Number sequences"},rule:{de:"Regellogik",en:"Rule logic"},analogy:{de:"Analogien",en:"Analogies"},deduction:{de:"Schlussfolgerungen",en:"Deduction"},matrix:{de:"Matrizen",en:"Matrices"},operator:{de:"Operatorlogik",en:"Operator logic"},exclusion:{de:"Ausschluss",en:"Exclusion"},spatial:{de:"Räumliche Logik",en:"Spatial logic"}}},
 {lab:"Language",href:"/training/language",key:"neburion-v65-language-stats-v3",kind:"modeStats",labels:{synonym:{de:"Synonyme",en:"Synonyms"},antonym:{de:"Antonyme",en:"Antonyms"},analogy:{de:"Analogien",en:"Analogies"},category:{de:"Kategorien",en:"Categories"},wordfield:{de:"Wortfelder",en:"Semantic fields"},sentence:{de:"Satzlogik",en:"Sentence logic"},relation:{de:"Beziehungen",en:"Relations"},context:{de:"Kontext",en:"Context"}}},
 {lab:"Visual",href:"/training/visual",key:"neburion-v65-visual-stats",kind:"modeStats",labels:{rotation:{de:"Rotation",en:"Rotation"},mirror:{de:"Spiegelung",en:"Mirroring"},pattern:{de:"Musterreihe",en:"Pattern sequence"},matrix:{de:"Matrix",en:"Matrix"},position:{de:"Positionswechsel",en:"Position shift"},search:{de:"Visuelle Suche",en:"Visual search"},compare:{de:"Formvergleich",en:"Shape comparison"},memory:{de:"Kurzzeitgedächtnis",en:"Short-term memory"}}},
 {lab:"BrainFit",href:"/training/brain-fit",key:"neburion-v65-brain-fit-v372",kind:"areaStats",labels:{sudoku:{de:"Tier-Sudoku",en:"Animal Sudoku"},words:{de:"Wortsuchraster",en:"Word search"},crossword:{de:"Kreuzworträtsel",en:"Crossword"},memory:{de:"Memory",en:"Memory"},categories:{de:"Kategorien",en:"Categories"},sequence:{de:"Reihen & Folgen",en:"Series & sequences"},everydayMath:{de:"Alltagsrechnen",en:"Everyday math"},timeOrder:{de:"Zeit & Reihenfolge",en:"Time & order"}}},
];

function readJson(key:string):Record<string,unknown>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):{};}catch{return {};}}

function collect(language:"de"|"en"):RepeatItem[]{
 const out:RepeatItem[]=[];
 for(const source of SOURCES){
  const data=readJson(source.key);
  const bucket=(data[source.kind]??{}) as Record<string,RawStat>;
  for(const [mode,label] of Object.entries(source.labels)){
   const stat=bucket[mode]??{};
   const attempts=source.kind==="areaStats"?Number(stat.sessions??0):Number(stat.attempts??0);
   if(attempts<4)continue;
   const accuracy=source.kind==="areaStats"?Math.round(Number(stat.totalScore??0)/attempts):Math.round(Number(stat.correct??0)/attempts*100);
   if(accuracy>=75)continue;
   const priority=Math.round((100-accuracy)*1.4+Math.min(20,attempts));
   out.push({lab:source.lab,mode,skill:label[language],href:source.href,attempts,accuracy,priority});
  }
 }
 return out.sort((a,b)=>b.priority-a.priority||a.accuracy-b.accuracy||b.attempts-a.attempts);
}

export function TargetedRepeatV1(){
 const {language,pick}=usePlatformLanguage();
 const [items,setItems]=useState<RepeatItem[]>([]);
 useEffect(()=>{const refresh=()=>setItems(collect(language));refresh();window.addEventListener("focus",refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener("focus",refresh);window.removeEventListener("storage",refresh);};},[language]);
 const plan=useMemo(()=>items.slice(0,3),[items]);
 const totalEvidence=useMemo(()=>plan.reduce((sum,item)=>sum+item.attempts,0),[plan]);

 return <section className={styles.shell} aria-labelledby="repeat-title">
  <div className={styles.head}>
   <div><span>{pick("Gezielte Wiederholung · V1","Targeted Review · V1")}</span><h2 id="repeat-title">{pick("Trainiere zuerst, was dich aktuell am meisten bremst.","Train first on what is currently holding you back the most.")}</h2><p>{pick("Der Wiederholungsplan verwendet nur Unterkategorien mit mindestens vier gespeicherten Antworten. Bereiche ohne belastbare Evidenz werden nicht als Schwäche behandelt.","The review plan only uses subcategories with at least four saved answers. Areas without reliable evidence are not treated as weaknesses.")}</p></div>
   <div className={styles.badge}><span>{pick("Plan","Plan")}</span><strong>{plan.length?pick(`${plan.length} Fokusbereiche`,`${plan.length} focus areas`):pick("noch offen","not started")}</strong><small>{plan.length?pick(`${totalEvidence} Antworten als Evidenz`,`${totalEvidence} answers as evidence`):pick("Zuerst weiter trainieren","Keep training first")}</small></div>
  </div>
  {plan.length?<div className={styles.grid}>{plan.map((item,index)=><article className={styles.card} key={`${item.lab}-${item.mode}`}>
    <div className={styles.rank}>0{index+1}</div><div className={styles.copy}><span>{item.lab}</span><h3>{item.skill}</h3><p>{pick(`${item.accuracy}% Trefferquote aus ${item.attempts} Antworten. Dieser Bereich bekommt im nächsten Wiederholungsblock Priorität.`,`${item.accuracy}% accuracy from ${item.attempts} answers. This area will be prioritized in the next review block.`)}</p><div className={styles.track}><i style={{width:`${item.accuracy}%`}}/></div></div>
    <Link href={`${item.href}?focus=${encodeURIComponent(item.mode)}&repeat=1`} className={styles.action}>{pick("Fokus öffnen","Open focus")} →</Link>
   </article>)}</div>:<div className={styles.empty}><strong>{pick("Noch kein belastbarer Schwächen-Fokus.","No reliable weakness focus yet.")}</strong><p>{pick("Sobald eine Unterkategorie mindestens vier Antworten gesammelt hat und unter 75% liegt, erscheint sie automatisch in diesem Plan.","As soon as a subcategory has at least four answers and falls below 75%, it will automatically appear in this plan.")}</p></div>}
 </section>;
}
