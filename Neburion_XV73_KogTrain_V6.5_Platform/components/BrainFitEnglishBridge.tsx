"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePlatformLanguage } from "./PlatformLanguageProvider";

const exact:Record<string,string>={
 "Gehirnfit & Alltag":"BrainFit & everyday skills","Rätseln, erinnern und den Kopf aktiv halten.":"Solve puzzles, remember and keep your mind active.",
 "Ein ruhiger, zugänglicher Trainingsbereich mit acht unterschiedlichen Denk- und Alltagsübungen. Neue Varianten sorgen bei jedem Neustart für Abwechslung.":"A calm, accessible training area with eight different thinking and everyday exercises. New variants add variety every time you restart.",
 "Entspannt":"Relaxed","Normal":"Normal","Herausforderung":"Challenge","Adaptiv":"Adaptive","Dein Gehirnfit-Profil":"Your BrainFit profile","Fortschritt ohne Leistungsdruck.":"Progress without performance pressure.",
 "Die Werte bleiben lokal in diesem Browser und helfen dabei, die adaptive Schwierigkeit nachvollziehbar anzupassen.":"Values stay local in this browser and help adjust adaptive difficulty transparently.",
 "Ø Ergebnis":"Avg. result","Trainiert":"Trained","Bereiche":"areas","Gehirnfit Übungen":"BrainFit exercises","Noch untrainiert":"Not trained yet",
 "Tier-Sudoku":"Animal Sudoku","Tier-Sudoku 4×4":"Animal Sudoku 4×4","Wortsuchraster":"Word search","Wörter im Raster finden":"Find words in the grid","Kreuzworträtsel":"Crossword","Memory":"Memory","Tier-Memory":"Animal Memory",
 "Kategorien":"Categories","Reihen & Folgen":"Sequences & patterns","Alltagsrechnen":"Everyday math","Zeit & Reihenfolge":"Time & order",
 "Rätsel":"Puzzle","Wörter":"Words","Sprache & Wissen":"Language & knowledge","Erinnern":"Memory","Gesuchte Wörter":"Words to find","Auswahl prüfen":"Check selection","Auswahl löschen":"Clear selection","Raster prüfen":"Check grid",
 "Waagrecht":"Across","Senkrecht":"Down","Gelöst ✓":"Solved ✓","Abgeschlossen":"Complete","Bereit":"Ready","Einheit starten":"Start set","Nächste Aufgabe":"Next task","Auswertung":"Results","Richtig ✓":"Correct ✓",
 "Noch sind nicht alle Kreuzungen richtig. Prüfe die gemeinsamen Buchstaben.":"Not all crossings are correct yet. Check the shared letters.","Das Kreuzworträtsel ist vollständig richtig. ✓":"The crossword is completely correct. ✓",
 "Geschafft – alle Begriffe und Kreuzungen stimmen. ✓":"Done — all words and crossings are correct. ✓","Alle Wörter gefunden. ✓":"All words found. ✓","Alle Paare gefunden – sehr schön. ✓":"All pairs found — great work. ✓",
 "Sehr gut – das Tier-Sudoku ist vollständig und regelkonform gelöst. ✓":"Great — the Animal Sudoku is complete and valid. ✓","Trainingsmodus":"Training mode",
 "Feld leeren":"Clear cell","Verdeckte Memory-Karte":"Hidden memory card","Aktiv den Kopf benutzen":"Use your mind actively",
 "BrainFit V5 starten":"Start BrainFit V5","Gemischte Denk-Session mit echter Dynamik.":"Mixed thinking session with real dynamic difficulty.",
 "Vier Alltags- und Denkbereiche wechseln automatisch. Drei sichere Treffer können das Niveau um eine Stufe erhöhen; zwei Fehler in Folge senken es höchstens um eine Stufe.":"Four everyday and thinking areas alternate automatically. Three reliable correct answers can raise the level by one step; two consecutive errors lower it by at most one step.",
 "Dynamik":"Dynamic","Neue V5 Session":"New V5 session","Adaptive BrainFit Session abgeschlossen.":"Adaptive BrainFit session complete."
};
const rules:Array<[RegExp,string]>=[
 [/Aktuell: Entspannt/g,"Current: Relaxed"],[/Aktuell: Normal/g,"Current: Normal"],[/Aktuell: Herausforderung/g,"Current: Challenge"],
 [/Entspannt · kein Zeitdruck · mehr Vorgaben und längere Anzeige/g,"Relaxed · no time pressure · more guidance and longer display"],
 [/Normal · ausgewogene Schwierigkeit und klare Hinweise/g,"Normal · balanced difficulty and clear guidance"],
 [/Herausforderung · weniger Vorgaben und kompaktere Unterstützung/g,"Challenge · less guidance and more compact support"],
 [/(\d+) Bereiche/g,"$1 areas"],[/(\d+) Paare/g,"$1 pairs"],[/(\d+) Begriffe/g,"$1 words"],[/(\d+) gefunden/g,"$1 found"],
 [/Aufgabe (\d+)\/(\d+)/g,"Task $1/$2"],[/Richtig wäre:/g,"Correct answer:"],[/Gefunden:/g,"Found:"],
 [/kurze Aufgaben mit wechselnden Inhalten\. Kein Zeitdruck; nach jeder Antwort siehst du sofort, ob sie passt\./g,"short tasks with changing content. No time pressure; after each answer you immediately see whether it is correct."],
 [/Starte eine neue, zufällig zusammengestellte Einheit\./g,"Start a new randomly assembled set."],
 [/Jedes Tier darf in jeder Zeile, Spalte und jedem markierten 2×2-Bereich nur einmal vorkommen\./g,"Each animal may appear only once in every row, column and marked 2×2 block"],
 [/Finde Wörter waagrecht, senkrecht, diagonal oder rückwärts\./g,"Find words horizontally, vertically, diagonally or backwards."],
 [/Finde gleiche Tierpaare\./g,"Find matching animal pairs."],
];
function translate(text:string){const trimmed=text.trim();if(!trimmed)return text;let out=exact[trimmed]??trimmed;for(const [r,v] of rules)out=out.replace(r,v);const lead=text.match(/^\s*/)?.[0]??"",trail=text.match(/\s*$/)?.[0]??"";return lead+out+trail;}

export function BrainFitEnglishBridge({children}:{children:ReactNode}){
 const {language}=usePlatformLanguage(); const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
   const root=ref.current;if(!root||language!=="en")return;
   let applying=false;
   const apply=()=>{
     if(applying)return;applying=true;
     const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null;
     while((node=walker.nextNode())){if(node.nodeValue){const next=translate(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}}
     root.querySelectorAll<HTMLElement>("[aria-label],[title],[placeholder]").forEach(el=>{for(const attr of ["aria-label","title","placeholder"]){const value=el.getAttribute(attr);if(value){const next=translate(value);if(next!==value)el.setAttribute(attr,next);}}});
     applying=false;
   };
   apply();
   const observer=new MutationObserver(()=>queueMicrotask(apply));observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["aria-label","title","placeholder"]});return()=>observer.disconnect();
 },[language]);
 return <div ref={ref}>{children}</div>;
}
