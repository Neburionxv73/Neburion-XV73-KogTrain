"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./BrainFitTraining.module.css";
import {
  adaptiveMode, areaAverage, BRAIN_FIT_AREAS, BRAIN_FIT_STORAGE_KEY, CROSSWORD_POOL,
  emptyBrainFitStats, mergeBrainFitStats, overallAverage, recommendedArea, recordBrainFitResult,
  shuffled, variedQuizTasks, WORD_SETS,
  type BrainFitArea, type BrainFitChoiceTask, type BrainFitMode, type BrainFitStats,
} from "@/lib/brainFit";

type Cell = { value:string; fixed:boolean };
type MemoryCard = { id:number; value:string; matched:boolean };

const ANIMALS=["🐶","🐱","🦊","🐼"];
const MEMORY_POOL=["🐶","🐱","🦊","🐼","🐸","🦉","🐰","🦋"];
const SUDOKU_SOLUTION=["🐶","🐱","🦊","🐼","🦊","🐼","🐶","🐱","🐱","🐶","🐼","🦊","🐼","🦊","🐱","🐶"];
const ALPHABET="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const QUIZ_AREAS:BrainFitArea[]=["categories","sequence","everydayMath","timeOrder"];

function makeSudoku(mode:BrainFitMode):Cell[]{
  const givens=mode==="relaxed"?[0,3,5,6,9,10,12,15]:mode==="normal"?[0,3,5,10,12,15]:[0,5,10,15];
  const fixed=new Set(givens);
  return SUDOKU_SOLUTION.map((value,index)=>({value:fixed.has(index)?value:"",fixed:fixed.has(index)}));
}

function makeMemory(mode:BrainFitMode):MemoryCard[]{
  const pairs=mode==="relaxed"?4:mode==="normal"?6:8;
  const values=MEMORY_POOL.slice(0,pairs);
  return shuffled([...values,...values]).map((value,index)=>({id:index,value,matched:false}));
}

function makeWordPuzzle(words:string[]){
  const size=10;
  const grid=Array.from({length:size},()=>Array.from({length:size},()=>""));
  const dirs=[[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]] as const;
  words.forEach((word)=>{
    let placed=false;
    for(let attempt=0;attempt<180&&!placed;attempt++){
      const [dr,dc]=dirs[Math.floor(Math.random()*dirs.length)];
      const row=Math.floor(Math.random()*size), col=Math.floor(Math.random()*size);
      const endRow=row+dr*(word.length-1), endCol=col+dc*(word.length-1);
      if(endRow<0||endRow>=size||endCol<0||endCol>=size) continue;
      let ok=true;
      for(let i=0;i<word.length;i++){
        const existing=grid[row+dr*i][col+dc*i];
        if(existing&&existing!==word[i]){ok=false;break;}
      }
      if(!ok) continue;
      for(let i=0;i<word.length;i++) grid[row+dr*i][col+dc*i]=word[i];
      placed=true;
    }
  });
  return grid.map(row=>row.map(letter=>letter||ALPHABET[Math.floor(Math.random()*ALPHABET.length)]));
}

function normalizeAnswer(value:string){
  return value.trim().toUpperCase().replaceAll("Ä","AE").replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("ß","SS");
}

const initialRecorded:Record<BrainFitArea,boolean>={sudoku:false,words:false,crossword:false,memory:false,categories:false,sequence:false,everydayMath:false,timeOrder:false};

export function BrainFitTraining(){
  const [mode,setMode]=useState<BrainFitMode>("relaxed");
  const [adaptive,setAdaptive]=useState(true);
  const [area,setArea]=useState<BrainFitArea>("sudoku");
  const [stats,setStats]=useState<BrainFitStats>(()=>emptyBrainFitStats());
  const [recorded,setRecorded]=useState(initialRecorded);
  const effectiveMode=adaptive?adaptiveMode(stats,area):mode;

  const [sudoku,setSudoku]=useState<Cell[]>(()=>makeSudoku("relaxed"));
  const [activeSudoku,setActiveSudoku]=useState<number|null>(null);
  const [wordSet,setWordSet]=useState<string[]>(WORD_SETS[0]);
  const [wordGrid,setWordGrid]=useState<string[][]>(()=>makeWordPuzzle(WORD_SETS[0]));
  const [selectedCells,setSelectedCells]=useState<number[]>([]);
  const [foundWords,setFoundWords]=useState<string[]>([]);
  const [crossword,setCrossword]=useState(()=>CROSSWORD_POOL.slice(0,6));
  const [crossAnswers,setCrossAnswers]=useState<string[]>(()=>Array(6).fill(""));
  const [memory,setMemory]=useState<MemoryCard[]>(()=>makeMemory("relaxed"));
  const [openCards,setOpenCards]=useState<number[]>([]);
  const [quizTasks,setQuizTasks]=useState<BrainFitChoiceTask[]>([]);
  const [quizIndex,setQuizIndex]=useState(0);
  const [quizCorrect,setQuizCorrect]=useState(0);
  const [quizSelected,setQuizSelected]=useState<string|null>(null);
  const [quizComplete,setQuizComplete]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    try{
      const raw=localStorage.getItem(BRAIN_FIT_STORAGE_KEY);
      if(raw) setStats(mergeBrainFitStats(JSON.parse(raw)));
    }catch{}
  },[]);

  const sudokuDone=useMemo(()=>sudoku.every((cell,index)=>cell.value===SUDOKU_SOLUTION[index]),[sudoku]);
  const wordDone=foundWords.length===wordSet.length;
  const crosswordDone=useMemo(()=>crossword.every((item,index)=>normalizeAnswer(crossAnswers[index]??"")===item.answer),[crossword,crossAnswers]);
  const memoryDone=memory.length>0&&memory.every(card=>card.matched);
  const recommended=recommendedArea(stats);
  const recommendedInfo=BRAIN_FIT_AREAS.find(item=>item.id===recommended)!;
  const areaInfo=BRAIN_FIT_AREAS.find(item=>item.id===area)!;
  const average=overallAverage(stats);

  function saveResult(target:BrainFitArea,score:number){
    if(recorded[target]) return;
    const next=recordBrainFitResult(stats,target,score);
    setStats(next);
    setRecorded(current=>({...current,[target]:true}));
    try{localStorage.setItem(BRAIN_FIT_STORAGE_KEY,JSON.stringify(next));}catch{}
  }

  useEffect(()=>{if(sudokuDone) saveResult("sudoku",100);},[sudokuDone]);
  useEffect(()=>{if(wordDone) saveResult("words",100);},[wordDone]);
  useEffect(()=>{if(crosswordDone) saveResult("crossword",100);},[crosswordDone]);
  useEffect(()=>{if(memoryDone) saveResult("memory",100);},[memoryDone]);

  function modeFor(target:BrainFitArea){return adaptive?adaptiveMode(stats,target):mode;}

  function prepareQuiz(target:BrainFitArea){
    setQuizTasks(QUIZ_AREAS.includes(target)?variedQuizTasks(target,modeFor(target)):[]);
    setQuizIndex(0);setQuizCorrect(0);setQuizSelected(null);setQuizComplete(false);
  }

  function switchArea(next:BrainFitArea){
    setArea(next);setMessage("");prepareQuiz(next);
  }

  function resetArea(){
    setMessage("");setRecorded(current=>({...current,[area]:false}));
    const level=modeFor(area);
    if(area==="sudoku"){setSudoku(makeSudoku(level));setActiveSudoku(null);}
    if(area==="words"){
      const next=shuffled(WORD_SETS)[0];setWordSet(next);setWordGrid(makeWordPuzzle(next));setSelectedCells([]);setFoundWords([]);
    }
    if(area==="crossword"){
      const count=level==="relaxed"?4:level==="normal"?6:8;
      const next=shuffled(CROSSWORD_POOL).slice(0,count);setCrossword(next);setCrossAnswers(Array(next.length).fill(""));
    }
    if(area==="memory"){setMemory(makeMemory(level));setOpenCards([]);}
    prepareQuiz(area);
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
    const letters=selectedCells.map(index=>wordGrid[Math.floor(index/10)][index%10]).join("");
    const reverse=letters.split("").reverse().join("");
    const match=wordSet.find(word=>word===letters||word===reverse);
    if(match){setFoundWords(current=>current.includes(match)?current:[...current,match]);setMessage(`Gefunden: ${match} ✓`);}else setMessage("Diese Auswahl ist noch kein gesuchtes Wort.");
    setSelectedCells([]);
  }

  function flipCard(index:number){
    if(memory[index].matched||openCards.includes(index)||openCards.length===2)return;
    const next=[...openCards,index];setOpenCards(next);
    if(next.length===2){
      const [a,b]=next;
      if(memory[a].value===memory[b].value) window.setTimeout(()=>{setMemory(current=>current.map((card,i)=>i===a||i===b?{...card,matched:true}:card));setOpenCards([]);},250);
      else window.setTimeout(()=>setOpenCards([]),effectiveMode==="relaxed"?1200:effectiveMode==="normal"?850:600);
    }
  }

  const currentTask=quizTasks[quizIndex];
  function answerQuiz(option:string){
    if(!currentTask||quizSelected)return;
    setQuizSelected(option);
    if(option===currentTask.answer)setQuizCorrect(value=>value+1);
  }

  function nextQuiz(){
    if(!currentTask||!quizSelected)return;
    if(quizIndex<quizTasks.length-1){setQuizIndex(value=>value+1);setQuizSelected(null);return;}
    const finalCorrect=quizCorrect;
    const score=Math.round((finalCorrect/quizTasks.length)*100);
    setQuizComplete(true);saveResult(area,score);
  }

  const modeText=effectiveMode==="relaxed"?"Entspannt · kein Zeitdruck · mehr Vorgaben und längere Anzeige":effectiveMode==="normal"?"Normal · ausgewogene Schwierigkeit und klare Hinweise":"Herausforderung · weniger Vorgaben und kompaktere Unterstützung";

  return <section className={styles.shell} aria-labelledby="brainfit-title">
    <div className={styles.hero}>
      <p className="eyebrow">Learning Expansion 3.7.4 · Gehirnfit & Alltag</p>
      <h1 id="brainfit-title">Rätseln, erinnern und den Kopf aktiv halten.</h1>
      <p>Ein ruhiger, zugänglicher Trainingsbereich mit acht unterschiedlichen Denk- und Alltagsübungen. Neue Varianten sorgen bei jedem Neustart für Abwechslung.</p>
      <div className={styles.modeRow} aria-label="Trainingsmodus">
        <button type="button" aria-pressed={!adaptive&&mode==="relaxed"} onClick={()=>{setAdaptive(false);setMode("relaxed");}}>Entspannt</button>
        <button type="button" aria-pressed={!adaptive&&mode==="normal"} onClick={()=>{setAdaptive(false);setMode("normal");}}>Normal</button>
        <button type="button" aria-pressed={!adaptive&&mode==="challenge"} onClick={()=>{setAdaptive(false);setMode("challenge");}}>Herausforderung</button>
        <button type="button" aria-pressed={adaptive} onClick={()=>setAdaptive(true)}>Adaptiv</button>
      </div>
      <div className={styles.hint}><strong>Aktuell: {effectiveMode==="relaxed"?"Entspannt":effectiveMode==="normal"?"Normal":"Herausforderung"}</strong><br/>{modeText}</div>
    </div>

    <section className={styles.progress} aria-labelledby="brainfit-progress-title">
      <div><p className="eyebrow">Dein Gehirnfit-Profil</p><h2 id="brainfit-progress-title">Fortschritt ohne Leistungsdruck.</h2><p>Die Werte bleiben lokal in diesem Browser. Sie dienen nur dazu, Schwierigkeit und Empfehlung nachvollziehbar anzupassen.</p></div>
      <div className={styles.metrics}><div><span>Sessions</span><strong>{stats.sessions}</strong></div><div><span>Ø Ergebnis</span><strong>{stats.sessions?`${average}%`:"–"}</strong></div><div><span>Empfohlen</span><strong>{recommendedInfo.icon} {recommendedInfo.title}</strong></div></div>
    </section>

    <div className={styles.tabs} role="tablist" aria-label="Gehirnfit Übungen">
      {BRAIN_FIT_AREAS.map(item=><button key={item.id} role="tab" aria-selected={area===item.id} onClick={()=>switchArea(item.id)}>{item.icon} {item.title}</button>)}
    </div>

    <div className={styles.panel}>
      <div className={styles.areaMeta}><span>{areaInfo.subtitle}</span><span>{stats.areaStats[area].sessions?`${areaAverage(stats.areaStats[area])}% Ø · ${stats.areaStats[area].sessions} Sessions`:"Noch untrainiert"}</span></div>

      {area==="sudoku"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Rätsel</p><h2>Tier-Sudoku 4×4</h2><p>Jedes Tier darf in jeder Zeile, Spalte und jedem 2×2-Bereich nur einmal vorkommen. Je höher das Niveau, desto weniger Felder sind vorgegeben.</p></div><span className={styles.status}>{sudokuDone?"Gelöst ✓":effectiveMode}</span></div>
        <div className={styles.sudoku}>{sudoku.map((cell,index)=><button key={index} type="button" data-fixed={cell.fixed} aria-label={`Feld ${index+1}${cell.value?`, ${cell.value}`:""}`} onClick={()=>!cell.fixed&&setActiveSudoku(index)} style={activeSudoku===index?{outline:"4px solid #18b696",outlineOffset:"2px"}:undefined}>{cell.value||"·"}</button>)}</div>
        <div className={styles.palette}>{ANIMALS.map(animal=><button key={animal} type="button" onClick={()=>setSudokuValue(animal)} aria-label={`${animal} einsetzen`}>{animal}</button>)}<button type="button" onClick={()=>setSudokuValue("")} aria-label="Feld leeren">×</button></div>
        {sudokuDone&&<div className={styles.success}>Sehr gut – das Tier-Sudoku ist vollständig gelöst. ✓</div>}
      </>}

      {area==="words"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Wörter</p><h2>Wörter im Raster finden</h2><p>Finde Wörter waagrecht, senkrecht, diagonal oder rückwärts. Markiere die Buchstaben in ihrer Reihenfolge und bestätige die Auswahl.</p></div><span className={styles.status}>{foundWords.length}/{wordSet.length} gefunden</span></div>
        <div className={styles.wordLayout}><div className={styles.wordGridWrap}><div className={styles.wordGrid}>{wordGrid.flat().map((letter,index)=><button key={index} type="button" className={styles.wordCell} data-selected={selectedCells.includes(index)} onClick={()=>toggleWordCell(index)}>{letter}</button>)}</div></div><div className={styles.wordList}><strong>Gesuchte Wörter</strong>{wordSet.map(word=><span key={word} data-found={foundWords.includes(word)}>{word}</span>)}</div></div>
        <div className={styles.actions}><button className={styles.primary} type="button" onClick={checkWordSelection}>Auswahl prüfen</button><button className={styles.secondary} type="button" onClick={()=>setSelectedCells([])}>Auswahl löschen</button></div>
        {wordDone&&<div className={styles.success}>Alle Wörter gefunden. ✓</div>}
      </>}

      {area==="crossword"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Sprache</p><h2>Begriffe aus Alltag und Wissen</h2><p>Löse wechselnde Hinweise aus Alltag, Natur und Sprache. Groß- oder Kleinschreibung spielt keine Rolle.</p></div><span className={styles.status}>{crosswordDone?"Alles richtig ✓":`${crossword.length} Begriffe`}</span></div>
        <div className={styles.crossword}>{crossword.map((item,index)=><div className={styles.clue} key={`${item.answer}-${index}`}><label htmlFor={`cross-${index}`}>{index+1}. {item.clue}</label><input id={`cross-${index}`} value={crossAnswers[index]??""} onChange={event=>setCrossAnswers(current=>current.map((value,i)=>i===index?event.target.value:value))} autoComplete="off" /></div>)}</div>
        <div className={styles.actions}><button className={styles.primary} type="button" onClick={()=>setMessage(crosswordDone?"Alle Begriffe sind richtig. ✓":"Noch nicht alle Begriffe stimmen. Du kannst in Ruhe weitermachen.")}>Antworten prüfen</button></div>
        {crosswordDone&&<div className={styles.success}>Geschafft – alle Begriffe sind richtig. ✓</div>}
      </>}

      {area==="memory"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Erinnern</p><h2>Tier-Memory</h2><p>Finde gleiche Tierpaare. Je nach Niveau spielst du mit vier, sechs oder acht Paaren; im entspannten Modus bleiben falsche Paare länger sichtbar.</p></div><span className={styles.status}>{memory.filter(card=>card.matched).length/2}/{memory.length/2} Paare</span></div>
        <div className={styles.memoryGrid}>{memory.map((card,index)=>{const open=card.matched||openCards.includes(index);return <button key={card.id} type="button" className={styles.memoryCard} data-open={open} data-matched={card.matched} onClick={()=>flipCard(index)} aria-label={open?card.value:"Verdeckte Memory-Karte"}>{open?card.value:"?"}</button>})}</div>
        {memoryDone&&<div className={styles.success}>Alle Paare gefunden – sehr schön. ✓</div>}
      </>}

      {QUIZ_AREAS.includes(area)&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">{areaInfo.subtitle}</p><h2>{areaInfo.title}</h2><p>{quizTasks.length||6} kurze Aufgaben mit wechselnden Inhalten. Kein Zeitdruck; nach jeder Antwort siehst du sofort, ob sie passt.</p></div><span className={styles.status}>{quizComplete?"Abgeschlossen":quizTasks.length?`${Math.min(quizIndex+1,quizTasks.length)}/${quizTasks.length}`:"Bereit"}</span></div>
        {!quizTasks.length&&!quizComplete&&<div className={styles.quizStart}><p>Starte eine neue, zufällig zusammengestellte Einheit.</p><button className={styles.primary} type="button" onClick={()=>prepareQuiz(area)}>Einheit starten</button></div>}
        {!quizComplete&&currentTask&&<div className={styles.quiz}><h3>{currentTask.prompt}</h3><div className={styles.quizOptions}>{currentTask.options.map(option=><button type="button" key={option} data-selected={quizSelected===option} data-correct={quizSelected!==null&&option===currentTask.answer} onClick={()=>answerQuiz(option)}>{option}</button>)}</div>{quizSelected&&<div className={quizSelected===currentTask.answer?styles.success:styles.hint}>{quizSelected===currentTask.answer?"Richtig ✓":`Fast – richtig wäre: ${currentTask.answer}`}</div>}<button className={styles.primary} type="button" disabled={!quizSelected} onClick={nextQuiz}>{quizIndex===quizTasks.length-1?"Auswertung":"Nächste Aufgabe"}</button></div>}
        {quizComplete&&<div className={styles.quizResult}><strong>{Math.round((quizCorrect/quizTasks.length)*100)}%</strong><h3>Einheit abgeschlossen.</h3><p>{quizCorrect} von {quizTasks.length} Aufgaben richtig. Der Wert fließt in deine adaptive Empfehlung ein.</p></div>}
      </>}

      {message&&<div className={styles.hint} role="status">{message}</div>}
      <div className={styles.actions}><button className={styles.secondary} type="button" onClick={resetArea}>Neue Variante</button>{recommended!==area&&<button className={styles.secondary} type="button" onClick={()=>switchArea(recommended)}>Empfehlung öffnen: {recommendedInfo.title}</button>}</div>
    </div>

    <p className={styles.note}>Gehirnfit & Alltag ist ein Lern- und Übungsangebot. Es stellt keine medizinische Diagnose, Behandlung oder Aussage über kognitive Erkrankungen dar.</p>
  </section>;
}
