import type { TrainingDomain, TrainingResult } from "@/features/cognitive-engine/types";
import { averageScore, dailyProgress, groupProgress, recentWindow, scoreTrend } from "@/features/progress-engine/analytics";

export type CoachTone = "start" | "stabilize" | "advance" | "balance";
export type CoachPlanStep = { order:number; title:string; detail:string; duration:string; href:string };
export type CoachInsight = { title:string; text:string; state:"positive"|"neutral"|"focus" };
export type CoachRecommendation = {
  title:string; text:string; domain:TrainingDomain; domainLabel:string; href:string;
  strategy:string; reason:string;
  confidence:"Erste Orientierung"|"Solide Datengrundlage"|"Hohe Datengrundlage";
  tone:CoachTone; weekSummary:string; plan:CoachPlanStep[]; insights:CoachInsight[];
};

const coreDomains:TrainingDomain[]=["gedaechtnis","aufmerksamkeit","logik","sprache","visuell"];
const domainConfig:Record<TrainingDomain,{label:string;href:string;strategy:string;warmup:string}>={
  gedaechtnis:{label:"Gedächtnis",href:"/memory-lab",strategy:"Bilde kleine Gruppen und verbinde Inhalte mit einem persönlichen Bild. Du nutzt damit eine klare Struktur als Stärke.",warmup:"Kurze Merksequenz mit übersichtlichen Kategorien"},
  aufmerksamkeit:{label:"Aufmerksamkeit",href:"/attention-lab",strategy:"Arbeite in einer festen Suchrichtung. Dein ruhiger Rhythmus hilft dir, sichere Entscheidungen aufzubauen.",warmup:"Ruhige visuelle Suche ohne Zeitdruck"},
  logik:{label:"Logik",href:"/logic-lab",strategy:"Vergleiche zwei benachbarte Elemente. Aus kleinen erkannten Veränderungen entsteht Schritt für Schritt die Gesamtregel.",warmup:"Klare Zahlen- oder Formenreihe"},
  sprache:{label:"Sprache",href:"/language-lab",strategy:"Verbinde Wörter mit Oberbegriffen und eigenen Beispielen. So wird vorhandenes Wissen leichter abrufbar.",warmup:"Kurze Kategorien- oder Synonymrunde"},
  visuell:{label:"Visuelle Wahrnehmung",href:"/visual-lab",strategy:"Beginne mit einem festen Merkmal wie Kante, Orientierung oder Position. Darauf kannst du weitere Details sicher aufbauen.",warmup:"Formvergleich mit wenigen Ablenkungen"},
  mathematik:{label:"Mathematik",href:"/training",strategy:"Zerlege die Aufgabe in kleine Schritte. Jeder geprüfte Zwischenschritt gibt dir eine verlässliche Grundlage.",warmup:"Kurze, übersichtliche Rechenfolge"}
};

function domainStats(results:TrainingResult[]){return groupProgress(results,"domain").map(row=>({domain:row.label as TrainingDomain,average:row.average,sessions:row.sessions,best:row.best}));}
function confidenceFor(results:TrainingResult[]):CoachRecommendation["confidence"]{if(results.length<5)return"Erste Orientierung";if(results.length<20)return"Solide Datengrundlage";return"Hohe Datengrundlage";}

function chooseGrowthPath(results:TrainingResult[]):TrainingDomain{
  const stats=domainStats(results).filter(item=>item.sessions>0);
  if(!stats.length)return"gedaechtnis";
  const recent=results.slice(0,4).map(item=>item.domain);
  const untouched=coreDomains.find(domain=>!stats.some(item=>item.domain===domain));
  if(untouched&&results.length>=3)return untouched;
  const stable=[...stats].sort((a,b)=>b.average-a.average||b.sessions-a.sessions)[0];
  const companions=coreDomains.filter(domain=>domain!==stable.domain&& !recent.slice(0,2).every(item=>item===domain));
  return companions.sort((a,b)=>(stats.find(s=>s.domain===a)?.sessions??0)-(stats.find(s=>s.domain===b)?.sessions??0))[0]??stable.domain;
}

function buildInsights(results:TrainingResult[],focus:TrainingDomain):CoachInsight[]{
  const stats=domainStats(results);
  const strongest=[...stats].sort((a,b)=>b.average-a.average)[0];
  const mostPracticed=[...stats].sort((a,b)=>b.sessions-a.sessions)[0];
  const trend=scoreTrend(results);
  const week=recentWindow(results,7);
  return [
    strongest?{title:"Deine tragende Stärke",text:`In ${domainConfig[strongest.domain].label} arbeitest du derzeit besonders sicher. Dein Durchschnitt von ${strongest.average}% zeigt eine stabile Grundlage.`,state:"positive"}:{title:"Deine tragende Stärke",text:"Schon die ersten Einheiten machen sichtbar, welche Strategien dir besonders gut liegen.",state:"positive"},
    {title:"Darauf bauen wir auf",text:`${domainConfig[focus].label} ergänzt deine bisherigen Erfolge und erweitert dein persönliches Fähigkeitsprofil in einem gut steuerbaren nächsten Schritt.`,state:"focus"},
    week.length?{title:"Dein wachsender Rhythmus",text:trend.direction==="up"?`Dein Wochenschnitt ist um ${trend.value} Punkte gewachsen. Du entwickelst Sicherheit durch Kontinuität.`:trend.direction==="down"?"Du hast weiter trainiert und damit Verlässlichkeit gezeigt. Heute darf Genauigkeit vor Tempo stehen.":`Dein Training ist stabil. ${mostPracticed?`${domainConfig[mostPracticed.domain].label} gibt dir dabei einen vertrauten Anker.`:""}`,state:trend.direction==="up"?"positive":"neutral"}:{title:"Dein wachsender Rhythmus",text:"Jede abgeschlossene Einheit wird Teil deiner persönlichen Entwicklungslinie.",state:"neutral"}
  ];
}

export function coachRecommendation(results:TrainingResult[]):CoachRecommendation{
  if(!results.length)return{
    title:"Ein guter Anfang beginnt mit deinem Tempo",text:"Du startest mit einer ruhigen Gedächtnisrunde. Es geht nicht darum, etwas zu beweisen, sondern deine vorhandenen Fähigkeiten bewusst wahrzunehmen.",domain:"gedaechtnis",domainLabel:"Gedächtnis",href:"/memory-lab",strategy:domainConfig.gedaechtnis.strategy,reason:"Noch liegen keine Trainingsergebnisse vor. Deshalb beginnt Neburion mit einer klaren, leicht zugänglichen Sequenz, die erste positive Erfahrungen sichtbar macht.",confidence:"Erste Orientierung",tone:"start",weekSummary:"Heute entsteht der erste Baustein deiner persönlichen Entwicklung. Auch eine kurze Einheit zählt.",plan:[
      {order:1,title:"Ankommen",detail:"Eine leichte Aufgabe ohne Zeitdruck.",duration:"2 Min.",href:"/memory-lab"},
      {order:2,title:"Erleben",detail:"Eine passende Strategie ausprobieren und den eigenen Rhythmus finden.",duration:"3 Min.",href:"/memory-lab"},
      {order:3,title:"Würdigen",detail:"Den abgeschlossenen Schritt bewusst als Fortschritt festhalten.",duration:"1 Min.",href:"/coach"}
    ],insights:buildInsights(results,"gedaechtnis")};

  const focus=chooseGrowthPath(results);const config=domainConfig[focus];const stats=domainStats(results);const strongest=[...stats].sort((a,b)=>b.average-a.average)[0];
  const focusItems=results.filter(item=>item.domain===focus);const focusAverage=averageScore(focusItems);const week=recentWindow(results,7);
  const previousWeek=results.filter(item=>{const t=new Date(item.createdAt).getTime();return t>=Date.now()-14*86400000&&t<Date.now()-7*86400000;});
  const weekAverage=averageScore(week);const previousAverage=averageScore(previousWeek);const days=dailyProgress(results,7).filter(day=>day.sessions>0).length;
  const tone:CoachTone=focusAverage>=88?"advance":focusAverage&&focusAverage<65?"stabilize":"balance";
  const title=tone==="advance"?`${config.label}: deine Sicherheit erweitert sich`:tone==="stabilize"?`${config.label}: auf einer ruhigen Grundlage weiterbauen`:`Dein nächster Entwicklungsschritt: ${config.label}`;
  const text=tone==="advance"?`Du hast in diesem Bereich bereits viel Sicherheit aufgebaut. Eine kurze neue Variation kann diese Stärke behutsam erweitern.`:tone==="stabilize"?`Dein Dranbleiben ist heute die wichtigste Leistung. Eine übersichtliche Sequenz gibt dir Raum, vorhandene Strategien sicher anzuwenden.`:`Wir verbinden deine bisherigen Erfolge mit einer passenden ${config.label}-Sequenz. So wächst dein Profil abwechslungsreich und in deinem Tempo.`;
  const strengthReason=strongest?`Als stabile Grundlage dient deine aktuelle Stärke ${domainConfig[strongest.domain].label} mit ${strongest.average}%. `:"";
  return {title,text,domain:focus,domainLabel:config.label,href:config.href,strategy:config.strategy,
    reason:`${strengthReason}Die Empfehlung ergänzt deine letzten Trainingsbereiche, berücksichtigt deinen Rhythmus und vermeidet monotone Wiederholungen. Sie ist eine Einladung, keine Bewertung.`,
    confidence:confidenceFor(results),tone,
    weekSummary:week.length?`Du hast in den letzten sieben Tagen ${week.length} Aufgaben an ${days} Tagen abgeschlossen. Damit hast du dir bewusst ${Math.round(week.reduce((s,i)=>s+i.durationSeconds,0)/60)} Minuten für deine Entwicklung genommen.${previousAverage&&weekAverage>=previousAverage?` Dein Durchschnitt ist dabei um ${weekAverage-previousAverage} Punkte gewachsen.`:" Jeder abgeschlossene Schritt stärkt deinen persönlichen Rhythmus."}`:"Eine kurze Einheit genügt, um deinen persönlichen Rhythmus wieder aufzunehmen.",
    plan:[
      {order:1,title:"Mit Stärke beginnen",detail:strongest?`Eine vertraute Strategie aus ${domainConfig[strongest.domain].label} bewusst aktivieren.`:config.warmup,duration:"2 Min.",href:strongest?domainConfig[strongest.domain].href:config.href},
      {order:2,title:"Sanft erweitern",detail:`Eine gut überschaubare ${config.label}-Sequenz in deinem gewählten Tempo.`,duration:"4 Min.",href:config.href},
      {order:3,title:"Fortschritt wahrnehmen",detail:"Festhalten, was heute gut funktioniert hat und worauf du weiter aufbauen möchtest.",duration:"1 Min.",href:"/coach"}
    ],insights:buildInsights(results,focus)};
}
