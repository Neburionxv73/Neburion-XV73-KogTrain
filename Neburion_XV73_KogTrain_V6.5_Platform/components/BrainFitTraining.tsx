"use client";

import { useMemo, useState } from "react";
import styles from "./BrainFitTraining.module.css";

type Mode = "relaxed" | "normal" | "challenge";
type Area = "sudoku" | "words" | "crossword" | "memory";

type Cell = { value:string; fixed:boolean };

const ANIMALS=["🐶","🐱","🦊","🐼"];
const SUDOKU_SOLUTION=["🐶","🐱","🦊","🐼","🦊","🐼","🐶","🐱","🐱","🐶","🐼","🦊","🐼","🦊","🐱","🐶"];
const SUDOKU_GIVENS=new Set([0,3,5,6,9,10,12,15]);
const WORDS=["APFEL","WALD","MOND","ROSE","VOGEL","BERG"];
const GRID=[
  ["A","P","F","E","L","K","R","M"],
  ["T","U","B","N","W","A","L","D"],
  ["M","O","N","D","S","E","E","Q"],
  ["R","O","S","E","Z","U","G","H"],
  ["V","O","G","E","L","T","A","L"],
  ["B","E","R","G","N","I","X","Y"],
  ["S","T","E","R","N","A","U","F"],
  ["K","A","T","Z","E","R","E","N"],
];
const CROSSWORD=[
  {clue:"Rundes Obst, oft rot oder grün.",answer:"APFEL"},
  {clue:"Große Ansammlung vieler Bäume.",answer:"WALD"},
  {clue:"Leuchtet nachts am Himmel.",answer:"MOND"},
  {clue:"Blume mit Dornen.",answer:"ROSE"},
  {clue:"Tier mit Federn und Flügeln.",answer:"VOGEL"},
  {clue:"Hohe natürliche Erhebung.",answer:"BERG"},
];
const MEMORY_VALUES=["🐶","🐱","🦊","🐼","🐶","🐱","🦊","🐼"];

function makeSudoku(): Cell[]{return SUDOKU_SOLUTION.map((value,index)=>({value:SUDOKU_GIVENS.has(index)?value:"",fixed:SUDOKU_GIVENS.has(index)}));}
function shuffledMemory(){return [...MEMORY_VALUES].sort(()=>Math.random()-.5).map((value,index)=>({id:index,value,matched:false}));}

export function BrainFitTraining(){
  const [mode,setMode]=useState<Mode>("relaxed");
  const [area,setArea]=useState<Area>("sudoku");
  const [sudoku,setSudoku]=useState<Cell[]>(()=>makeSudoku());
  const [activeSudoku,setActiveSudoku]=useState<number|null>(null);
  const [selectedCells,setSelectedCells]=useState<number[]>([]);
  const [foundWords,setFoundWords]=useState<string[]>([]);
  const [crossAnswers,setCrossAnswers]=useState<string[]>(()=>CROSSWORD.map(()=>""));
  const [memory,setMemory]=useState(()=>shuffledMemory());
  const [openCards,setOpenCards]=useState<number[]>([]);
  const [message,setMessage]=useState("");

  const sudokuDone=useMemo(()=>sudoku.every((cell,index)=>cell.value===SUDOKU_SOLUTION[index]),[sudoku]);
  const crosswordDone=useMemo(()=>CROSSWORD.every((item,index)=>crossAnswers[index].trim().toUpperCase()===item.answer),[crossAnswers]);
  const memoryDone=memory.every(card=>card.matched);

  function resetArea(){
    setMessage("");
    if(area==="sudoku"){setSudoku(makeSudoku());setActiveSudoku(null);}
    if(area==="words"){setSelectedCells([]);setFoundWords([]);}
    if(area==="crossword"){setCrossAnswers(CROSSWORD.map(()=>""));}
    if(area==="memory"){setMemory(shuffledMemory());setOpenCards([]);}
  }

  function setSudokuValue(value:string){
    if(activeSudoku===null||sudoku[activeSudoku].fixed)return;
    setSudoku(current=>current.map((cell,index)=>index===activeSudoku?{...cell,value}:cell));
  }

  function toggleWordCell(index:number){
    setMessage("");
    setSelectedCells(current=>current.includes(index)?current.filter(item=>item!==index):[...current,index]);
  }

  function checkWordSelection(){
    if(!selectedCells.length){setMessage("Markiere zuerst Buchstaben im Raster.");return;}
    const letters=selectedCells.map(index=>GRID[Math.floor(index/8)][index%8]).join("");
    const reverse=letters.split("").reverse().join("");
    const match=WORDS.find(word=>word===letters||word===reverse);
    if(match){setFoundWords(current=>current.includes(match)?current:[...current,match]);setMessage(`Gefunden: ${match} ✓`);}else setMessage("Diese Auswahl ist noch kein gesuchtes Wort.");
    setSelectedCells([]);
  }

  function flipCard(index:number){
    if(memory[index].matched||openCards.includes(index)||openCards.length===2)return;
    const next=[...openCards,index];setOpenCards(next);
    if(next.length===2){
      const [a,b]=next;
      if(memory[a].value===memory[b].value){
        window.setTimeout(()=>{setMemory(current=>current.map((card,i)=>i===a||i===b?{...card,matched:true}:card));setOpenCards([]);},250);
      }else window.setTimeout(()=>setOpenCards([]),mode==="relaxed"?1100:700);
    }
  }

  const modeText=mode==="relaxed"?"Ohne Zeitdruck · große Bedienelemente · ruhiges Tempo":mode==="normal"?"Normales Tempo · klare Hinweise · ausgewogene Schwierigkeit":"Mehr Eigenständigkeit · weniger Hinweise · anspruchsvoller";

  return <section className={styles.shell} aria-labelledby="brainfit-title">
    <div className={styles.hero}>
      <p className="eyebrow">Learning Expansion 3.7 · Gehirnfit & Alltag</p>
      <h1 id="brainfit-title">Rätseln, erinnern und den Kopf aktiv halten.</h1>
      <p>Ein ruhiger Trainingsbereich mit klassischen Rätseln und alltagsnahen Denkaufgaben. Du entscheidest selbst über Tempo und Herausforderung. Kein Zeitdruck im entspannten Modus.</p>
      <div className={styles.modeRow} aria-label="Trainingsmodus">
        <button type="button" aria-pressed={mode==="relaxed"} onClick={()=>setMode("relaxed")}>Entspannt</button>
        <button type="button" aria-pressed={mode==="normal"} onClick={()=>setMode("normal")}>Normal</button>
        <button type="button" aria-pressed={mode==="challenge"} onClick={()=>setMode("challenge")}>Herausforderung</button>
      </div>
      <div className={styles.hint}>{modeText}</div>
    </div>

    <div className={styles.tabs} role="tablist" aria-label="Gehirnfit Übungen">
      <button role="tab" aria-selected={area==="sudoku"} onClick={()=>{setArea("sudoku");setMessage("");}}>🐾 Tier-Sudoku</button>
      <button role="tab" aria-selected={area==="words"} onClick={()=>{setArea("words");setMessage("");}}>🔎 Wortsuchraster</button>
      <button role="tab" aria-selected={area==="crossword"} onClick={()=>{setArea("crossword");setMessage("");}}>✍️ Kreuzworträtsel</button>
      <button role="tab" aria-selected={area==="memory"} onClick={()=>{setArea("memory");setMessage("");}}>🧠 Memory</button>
    </div>

    <div className={styles.panel}>
      {area==="sudoku"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Rätsel</p><h2>Tier-Sudoku 4×4</h2><p>Jedes Tier darf in jeder Zeile, Spalte und jedem 2×2-Bereich nur einmal vorkommen.</p></div><span className={styles.status}>{sudokuDone?"Gelöst ✓":"Ohne Zeitlimit"}</span></div>
        <div className={styles.sudoku}>{sudoku.map((cell,index)=><button key={index} type="button" data-fixed={cell.fixed} aria-label={`Feld ${index+1}${cell.value?`, ${cell.value}`:""}`} onClick={()=>!cell.fixed&&setActiveSudoku(index)} style={activeSudoku===index?{outline:"4px solid #18b696",outlineOffset:"2px"}:undefined}>{cell.value||"·"}</button>)}</div>
        <div className={styles.palette}>{ANIMALS.map(animal=><button key={animal} type="button" onClick={()=>setSudokuValue(animal)} aria-label={`${animal} einsetzen`}>{animal}</button>)}<button type="button" onClick={()=>setSudokuValue("")} aria-label="Feld leeren">×</button></div>
        {sudokuDone&&<div className={styles.success}>Sehr gut – das Tier-Sudoku ist vollständig gelöst. ✓</div>}
      </>}

      {area==="words"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Wörter</p><h2>Wörter im Raster finden</h2><p>Markiere die Buchstaben eines Wortes und bestätige deine Auswahl. Die Wörter liegen waagrecht im Raster; später erweitern wir auf diagonal und rückwärts.</p></div><span className={styles.status}>{foundWords.length}/{WORDS.length} gefunden</span></div>
        <div className={styles.wordLayout}><div className={styles.wordGrid}>{GRID.flat().map((letter,index)=><button key={index} type="button" className={styles.wordCell} data-selected={selectedCells.includes(index)} onClick={()=>toggleWordCell(index)}>{letter}</button>)}</div><div className={styles.wordList}><strong>Gesuchte Wörter</strong>{WORDS.map(word=><span key={word} data-found={foundWords.includes(word)}>{word}</span>)}</div></div>
        <div className={styles.actions}><button className={styles.primary} type="button" onClick={checkWordSelection}>Auswahl prüfen</button><button className={styles.secondary} type="button" onClick={()=>setSelectedCells([])}>Auswahl löschen</button></div>
      </>}

      {area==="crossword"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Sprache</p><h2>Kleines Kreuzworträtsel</h2><p>Löse die Begriffe aus Alltag und Natur. Groß- oder Kleinschreibung spielt keine Rolle.</p></div><span className={styles.status}>{crosswordDone?"Alles richtig ✓":"6 Begriffe"}</span></div>
        <div className={styles.crossword}>{CROSSWORD.map((item,index)=><div className={styles.clue} key={item.answer}><label htmlFor={`cross-${index}`}>{index+1}. {item.clue}</label><input id={`cross-${index}`} value={crossAnswers[index]} onChange={event=>setCrossAnswers(current=>current.map((value,i)=>i===index?event.target.value:value))} autoComplete="off" /></div>)}</div>
        <div className={styles.actions}><button className={styles.primary} type="button" onClick={()=>setMessage(crosswordDone?"Alle Begriffe sind richtig. ✓":"Noch nicht alle Begriffe stimmen. Du kannst in Ruhe weitermachen.")}>Antworten prüfen</button></div>
        {crosswordDone&&<div className={styles.success}>Geschafft – alle sechs Begriffe sind richtig. ✓</div>}
      </>}

      {area==="memory"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Erinnern</p><h2>Tier-Memory</h2><p>Finde die vier gleichen Tierpaare. Im entspannten Modus bleiben falsche Paare etwas länger sichtbar.</p></div><span className={styles.status}>{memory.filter(card=>card.matched).length/2}/4 Paare</span></div>
        <div className={styles.memoryGrid}>{memory.map((card,index)=>{const open=card.matched||openCards.includes(index);return <button key={card.id} type="button" className={styles.memoryCard} data-open={open} data-matched={card.matched} onClick={()=>flipCard(index)} aria-label={open?card.value:"Verdeckte Memory-Karte"}>{open?card.value:"?"}</button>})}</div>
        {memoryDone&&<div className={styles.success}>Alle Paare gefunden – sehr schön. ✓</div>}
      </>}

      {message&&<div className={styles.hint} role="status">{message}</div>}
      <div className={styles.actions}><button className={styles.secondary} type="button" onClick={resetArea}>Diese Übung neu starten</button></div>
    </div>

    <p className={styles.note}>Gehirnfit & Alltag ist ein Lern- und Übungsangebot. Es stellt keine medizinische Diagnose, Behandlung oder Aussage über kognitive Erkrankungen dar.</p>
  </section>;
}
