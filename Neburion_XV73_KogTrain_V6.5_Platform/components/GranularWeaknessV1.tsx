"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePlatformLanguage } from "./PlatformLanguageProvider";
import styles from "./GranularWeaknessV1.module.css";

type RawStat={attempts?:number;correct?:number;sessions?:number;totalScore?:number};
type InsightState="focus"|"stable"|"strong"|"evidence"|"open";
type Insight={labId:string;skillId:string;href:string;attempts:number;accuracy:number|null;priority:number;state:InsightState};
type Source={labId:string;href:string;key:string;kind:"modeStats"|"areaStats";skillIds:string[]};

const SOURCES:Source[]=[
 {labId:"memory",href:"/training/memory",key:"neburion-v65-memory-progress",kind:"modeStats",skillIds:["digits","reverse","words","symbols","positions","recognition","nback1","nback2"]},
 {labId:"attention",href:"/training/attention",key:"neburion-v65-attention-stats",kind:"modeStats",skillIds:["go-no-go","visual-search","rule-switch","inhibition","divided","speed","interference"]},
 {labId:"logic",href:"/training/logic",key:"neburion-v65-logic-stats-v3",kind:"modeStats",skillIds:["sequence","rule","analogy","deduction","matrix","operator","exclusion","spatial"]},
 {labId:"language",href:"/training/language",key:"neburion-v65-language-stats-v3",kind:"modeStats",skillIds:["synonym","antonym","analogy","category","wordfield","sentence","relation","context"]},
 {labId:"visual",href:"/training/visual",key:"neburion-v65-visual-stats",kind:"modeStats",skillIds:["rotation","mirror","pattern","matrix","position","search","compare","memory"]},
 {labId:"brainfit",href:"/training/brain-fit",key:"neburion-v65-brain-fit-v372",kind:"areaStats",skillIds:["sudoku","words","crossword","memory","categories","sequence","everydayMath","timeOrder"]},
];

function readJson(key:string):Record<string,unknown>{
 try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):{};}catch{return {};}
}

function stateFor(attempts:number,accuracy:number|null):InsightState{
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
  source.skillIds.forEach(skillId=>{
   const stat=bucket[skillId]??{};
   const attempts=source.kind==="areaStats"?Number(stat.sessions??0):Number(stat.attempts??0);
   const correct=Number(stat.correct??0);
   const totalScore=Number(stat.totalScore??0);
   const accuracy=attempts>0?(source.kind==="areaStats"?Math.round(totalScore/attempts):Math.round(correct/attempts*100)):null;
   result.push({labId:source.labId,skillId,href:source.href,attempts,accuracy,priority:priorityFor(attempts,accuracy),state:stateFor(attempts,accuracy)});
  });
 });
 return result;
}

export function GranularWeaknessV1(){
 const { language, pick }=usePlatformLanguage();
 const [items,setItems]=useState<Insight[]>([]);
 useEffect(()=>{const refresh=()=>setItems(collect());refresh();window.addEventListener("focus",refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener("focus",refresh);window.removeEventListener("storage",refresh);};},[]);

 const labLabel=(labId:string)=>({
  memory:pick("Memory","Memory"),attention:pick("Attention","Attention"),logic:pick("Logic","Logic"),language:pick("Language","Language"),visual:pick("Visual","Visual"),brainfit:pick("Gehirnfit","BrainFit")
 }[labId]??labId);

 const skillLabel=(labId:string,skillId:string)=>{
  const labels:Record<string,Record<string,[string,string]>>={
   memory:{digits:["Zahlen","Digits"],reverse:["Rückwärts","Reverse recall"],words:["Wörter","Words"],symbols:["Symbole","Symbols"],positions:["Positionen","Positions"],recognition:["Erkennen","Recognition"],nback1:["1-Back","1-Back"],nback2:["2-Back","2-Back"]},
   attention:{"go-no-go":["Go / No-Go","Go / No-Go"],"visual-search":["Visuelle Suche","Visual search"],"rule-switch":["Regelwechsel","Rule switching"],inhibition:["Hemmung","Inhibition"],divided:["Geteilte Aufmerksamkeit","Divided attention"],speed:["Tempo","Processing speed"],interference:["Interferenz","Interference"]},
   logic:{sequence:["Zahlenfolgen","Number sequences"],rule:["Regellogik","Rule logic"],analogy:["Analogien","Analogies"],deduction:["Schlussfolgerungen","Deduction"],matrix:["Matrizen","Matrices"],operator:["Operatorlogik","Operator logic"],exclusion:["Ausschluss","Exclusion"],spatial:["Räumliche Logik","Spatial reasoning"]},
   language:{synonym:["Synonyme","Synonyms"],antonym:["Antonyme","Antonyms"],analogy:["Analogien","Analogies"],category:["Kategorien","Categories"],wordfield:["Wortfelder","Semantic fields"],sentence:["Satzlogik","Sentence logic"],relation:["Beziehungen","Relationships"],context:["Kontext","Context"]},
   visual:{rotation:["Rotation","Rotation"],mirror:["Spiegelung","Mirroring"],pattern:["Musterreihe","Pattern sequence"],matrix:["Matrix","Matrix"],position:["Positionswechsel","Position changes"],search:["Visuelle Suche","Visual search"],compare:["Formvergleich","Shape comparison"],memory:["Kurzzeitgedächtnis","Visual short-term memory"]},
   brainfit:{sudoku:["Tier-Sudoku","Animal Sudoku"],words:["Wortsuchraster","Word search"],crossword:["Kreuzworträtsel","Crossword"],memory:["Memory","Memory"],categories:["Kategorien","Categories"],sequence:["Reihen & Folgen","Sequences & patterns"],everydayMath:["Alltagsrechnen","Everyday math"],timeOrder:["Zeit & Reihenfolge","Time & order"]},
  };
  const pair=labels[labId]?.[skillId];
  return pair?(language==="en"?pair[1]:pair[0]):skillId;
 };

 const stateLabel=(state:InsightState)=>({
  focus:pick("Fokus","Focus"),stable:pick("Stabil","Stable"),strong:pick("Stark","Strong"),evidence:pick("Mehr Evidenz","More evidence"),open:pick("Noch offen","Not started")
 }[state]);

 const ranked=useMemo(()=>[...items].sort((a,b)=>b.priority-a.priority||a.attempts-b.attempts||skillLabel(a.labId,a.skillId).localeCompare(skillLabel(b.labId,b.skillId),language)).slice(0,6),[items,language]);
 const measured=items.filter(item=>item.attempts>=4);
 const weakest=measured.filter(item=>item.state==="focus").sort((a,b)=>(a.accuracy??101)-(b.accuracy??101))[0];
 const strongest=measured.filter(item=>item.state==="strong").sort((a,b)=>(b.accuracy??0)-(a.accuracy??0))[0];
 const evidence=items.filter(item=>item.state==="evidence"||item.state==="open").length;

 const summarySkill=(item:Insight|undefined)=>item?`${skillLabel(item.labId,item.skillId)} · ${item.accuracy}%`:pick("noch offen","not enough data");
 const evidenceText=(item:Insight)=>{
  if(item.attempts===0)return pick("Noch keine gespeicherten Antworten. Dieser Bereich wird nicht als Schwäche bewertet.","No answers have been saved yet. This area is not rated as a weakness.");
  if(item.attempts<4)return language==="en"?`${item.attempts} ${item.attempts===1?"answer":"answers"} · collect more evidence first.`:`${item.attempts} Antwort${item.attempts===1?"":"en"} · zuerst weitere Evidenz sammeln.`;
  return language==="en"?`${item.attempts} answers · ${item.accuracy}% accuracy.`:`${item.attempts} Antworten · ${item.accuracy}% Trefferquote.`;
 };
 const actionText=(state:InsightState)=>state==="focus"?pick("Gezielte Wiederholung empfohlen","Targeted repetition recommended"):state==="strong"?pick("Stabil halten","Maintain strength"):state==="stable"?pick("Weiter festigen","Keep reinforcing"):state==="evidence"?pick("Noch nicht belastbar","More evidence needed"):pick("Erst trainieren","Train first");

 return <section className={styles.shell} aria-labelledby="granular-title">
  <div className={styles.head}><div><span>{pick("Adaptive Analyse V1","Adaptive Analysis V1")}</span><h2 id="granular-title">{pick("Stärken und Schwächen nach Unterkategorie","Strengths and weaknesses by subcategory")}</h2><p>{pick("Die Auswertung trennt echte Schwächen von Bereichen mit zu wenig Evidenz. Priorisiert wird erst dann deutlich, wenn genügend Antworten gespeichert sind.","The analysis separates genuine weaknesses from areas with too little evidence. Clear prioritization begins only after enough answers have been saved.")}</p></div><div className={styles.summary}><div><span>{pick("Fokus","Focus")}</span><strong>{summarySkill(weakest)}</strong></div><div><span>{pick("Stärke","Strength")}</span><strong>{summarySkill(strongest)}</strong></div><div><span>{pick("Evidenz offen","Evidence pending")}</span><strong>{evidence}</strong></div></div></div>
  <div className={styles.grid}>{ranked.map(item=><Link href={item.href} className={styles.card} key={`${item.labId}-${item.skillId}`} data-state={item.state}><div><span>{labLabel(item.labId)}</span><b>{stateLabel(item.state)}</b></div><h3>{skillLabel(item.labId,item.skillId)}</h3><p>{evidenceText(item)}</p><div className={styles.track}><i style={{width:`${item.accuracy??0}%`}}/></div><small>{actionText(item.state)} →</small></Link>)}</div>
 </section>;
}
