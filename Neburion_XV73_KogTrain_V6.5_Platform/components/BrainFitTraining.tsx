"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./BrainFitTraining.module.css";
import {
  adaptiveMode, areaAverage, BRAIN_FIT_AREAS, BRAIN_FIT_STORAGE_KEY, CROSSWORD_POOL,
  emptyBrainFitStats, mergeBrainFitStats, overallAverage, recordBrainFitResult,
  shuffled, variedQuizTasks, WORD_SETS,
  type BrainFitArea, type BrainFitChoiceTask, type BrainFitMode, type BrainFitStats,
} from "@/lib/brainFit";

type Cell = { value:string; fixed:boolean };
type MemoryCard = { id:number; value:string; matched:boolean };
type SudokuRound = { solution:string[]; cells:Cell[] };
type WordPuzzle = { grid:string[][]; words:string[] };
type CrosswordDirection = "across" | "down";
type CrosswordEntry = { id:number; number:number; clue:string; answer:string; row:number; col:number; direction:CrosswordDirection };
type CrosswordCell = { answer:string; number?:number };
type CrosswordPuzzle = { rows:number; cols:number; entries:CrosswordEntry[]; cells:Record<string,CrosswordCell> };

const ANIMALS=["🐶","🐱","🦊","🐼"];
const MEMORY_POOL=["🐶","🐱","🦊","🐼","🐸","🦉","🐰","🦋"];
const BASE_SUDOKU=[0,1,2,3,2,3,0,1,1,0,3,2,3,2,1,0];
const ALPHABET="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const QUIZ_AREAS:BrainFitArea[]=["categories","sequence","everydayMath","timeOrder"];
const WORD_GRID_SIZE=10;
const CROSSWORD_SIZE=13;
const DIRECTIONS=[[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]] as const;

function makeSudokuRound(mode:BrainFitMode):SudokuRound{
  const symbols=shuffled(ANIMALS);
  let rows=[[0,1],[2,3]];
  let cols=[[0,1],[2,3]];
  rows=shuffled(rows).map(pair=>shuffled(pair));
  cols=shuffled(cols).map(pair=>shuffled(pair));
  const rowOrder=rows.flat();
  const colOrder=cols.flat();
  const solution:number[]=[];
  rowOrder.forEach(row=>colOrder.forEach(col=>solution.push(BASE_SUDOKU[row*4+col])));
  const mapped=solution.map(value=>symbols[value]);
  const givenCount=mode==="relaxed"?8:mode==="normal"?6:4;
  const candidateIndices=shuffled(Array.from({length:16},(_,index)=>index));
  const fixed=new Set(candidateIndices.slice(0,givenCount));
  return {solution:mapped,cells:mapped.map((value,index)=>({value:fixed.has(index)?value:"",fixed:fixed.has(index)}))};
}

function makeMemory(mode:BrainFitMode):MemoryCard[]{
  const pairs=mode==="relaxed"?4:mode==="normal"?6:8;
  const values=MEMORY_POOL.slice(0,pairs);
  return shuffled([...values,...values]).map((value,index)=>({id:index,value,matched:false}));
}

function tryWordPuzzle(words:string[]):WordPuzzle|null{
  const grid=Array.from({length:WORD_GRID_SIZE},()=>Array.from({length:WORD_GRID_SIZE},()=>""));
  for(const word of words){
    let placed=false;
    for(let attempt=0;attempt<260&&!placed;attempt++){
      const [dr,dc]=DIRECTIONS[Math.floor(Math.random()*DIRECTIONS.length)];
      const row=Math.floor(Math.random()*WORD_GRID_SIZE), col=Math.floor(Math.random()*WORD_GRID_SIZE);
      const endRow=row+dr*(word.length-1), endCol=col+dc*(word.length-1);
      if(endRow<0||endRow>=WORD_GRID_SIZE||endCol<0||endCol>=WORD_GRID_SIZE) continue;
      let ok=true;
      for(let i=0;i<word.length;i++){
        const existing=grid[row+dr*i][col+dc*i];
        if(existing&&existing!==word[i]){ok=false;break;}
      }
      if(!ok) continue;
      for(let i=0;i<word.length;i++) grid[row+dr*i][col+dc*i]=word[i];
      placed=true;
    }
    if(!placed) return null;
  }
  return {grid:grid.map(row=>row.map(letter=>letter||ALPHABET[Math.floor(Math.random()*ALPHABET.length)])),words};
}

function makeWordPuzzle(words:string[]):WordPuzzle{
  for(let board=0;board<50;board++){
    const result=tryWordPuzzle(words);
    if(result) return result;
  }
  const safeWords=words.filter(word=>word.length<=WORD_GRID_SIZE).slice(0,4);
  return tryWordPuzzle(safeWords) ?? {grid:Array.from({length:WORD_GRID_SIZE},()=>Array.from({length:WORD_GRID_SIZE},()=>ALPHABET[Math.floor(Math.random()*ALPHABET.length)])),words:[]};
}

function normalizeAnswer(value:string){
  return value.trim().toUpperCase().replaceAll("Ä","AE").replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("ß","SS");
}

function keyOf(row:number,col:number){return `${row}:${col}`;}

function validateCrosswordPlacement(
  grid:Array<Array<{char:string;across:boolean;down:boolean}|null>>,
  answer:string,row:number,col:number,direction:CrosswordDirection,
){
  const dr=direction==="down"?1:0, dc=direction==="across"?1:0;
  const beforeRow=row-dr,beforeCol=col-dc,afterRow=row+dr*answer.length,afterCol=col+dc*answer.length;
  if(beforeRow>=0&&beforeRow<CROSSWORD_SIZE&&beforeCol>=0&&beforeCol<CROSSWORD_SIZE&&grid[beforeRow][beforeCol]) return -1;
  if(afterRow>=0&&afterRow<CROSSWORD_SIZE&&afterCol>=0&&afterCol<CROSSWORD_SIZE&&grid[afterRow][afterCol]) return -1;
  let intersections=0;
  for(let i=0;i<answer.length;i++){
    const r=row+dr*i,c=col+dc*i;
    if(r<0||r>=CROSSWORD_SIZE||c<0||c>=CROSSWORD_SIZE) return -1;
    const existing=grid[r][c];
    if(existing){
      if(existing.char!==answer[i]) return -1;
      if(direction==="across"&&existing.across) return -1;
      if(direction==="down"&&existing.down) return -1;
      intersections++;
    }else{
      if(direction==="across"){
        if((r>0&&grid[r-1][c])||(r<CROSSWORD_SIZE-1&&grid[r+1][c])) return -1;
      }else{
        if((c>0&&grid[r][c-1])||(c<CROSSWORD_SIZE-1&&grid[r][c+1])) return -1;
      }
    }
  }
  return intersections;
}

function buildCrossword(entries:Array<{clue:string;answer:string}>,targetCount:number):CrosswordPuzzle|null{
  const grid:Array<Array<{char:string;across:boolean;down:boolean}|null>>=Array.from({length:CROSSWORD_SIZE},()=>Array(CROSSWORD_SIZE).fill(null));
  const placed:Array<Omit<CrosswordEntry,"number">>=[];
  const candidates=entries.map(item=>({...item,answer:normalizeAnswer(item.answer)})).sort((a,b)=>b.answer.length-a.answer.length);
  const first=candidates.shift();
  if(!first) return null;
  const firstRow=Math.floor(CROSSWORD_SIZE/2), firstCol=Math.max(1,Math.floor((CROSSWORD_SIZE-first.answer.length)/2));
  first.answer.split("").forEach((char,i)=>grid[firstRow][firstCol+i]={char,across:true,down:false});
  placed.push({id:0,clue:first.clue,answer:first.answer,row:firstRow,col:firstCol,direction:"across"});

  while(placed.length<targetCount&&candidates.length){
    let best:{candidateIndex:number;row:number;col:number;direction:CrosswordDirection;score:number}|null=null;
    for(let ci=0;ci<candidates.length;ci++){
      const answer=candidates[ci].answer;
      for(let r=0;r<CROSSWORD_SIZE;r++) for(let c=0;c<CROSSWORD_SIZE;c++){
        const existing=grid[r][c];
        if(!existing) continue;
        for(let i=0;i<answer.length;i++){
          if(answer[i]!==existing.char) continue;
          const options:CrosswordDirection[]=[];
          if(existing.across&&!existing.down) options.push("down");
          if(existing.down&&!existing.across) options.push("across");
          for(const direction of options){
            const row=direction==="down"?r-i:r;
            const col=direction==="across"?c-i:c;
            const score=validateCrosswordPlacement(grid,answer,row,col,direction);
            if(score>0&&(!best||score>best.score)) best={candidateIndex:ci,row,col,direction,score};
          }
        }
      }
    }
    if(!best) break;
    const item=candidates.splice(best.candidateIndex,1)[0];
    const dr=best.direction==="down"?1:0,dc=best.direction==="across"?1:0;
    item.answer.split("").forEach((char,i)=>{
      const r=best!.row+dr*i,c=best!.col+dc*i;
      const current=grid[r][c];
      grid[r][c]={char,across:best!.direction==="across"||(current?.across??false),down:best!.direction==="down"||(current?.down??false)};
    });
    placed.push({id:placed.length,clue:item.clue,answer:item.answer,row:best.row,col:best.col,direction:best.direction});
  }

  if(placed.length<Math.min(4,targetCount)) return null;
  const minRow=Math.min(...placed.map(item=>item.row));
  const minCol=Math.min(...placed.map(item=>item.col));
  const maxRow=Math.max(...placed.map(item=>item.row+(item.direction==="down"?item.answer.length-1:0)));
  const maxCol=Math.max(...placed.map(item=>item.col+(item.direction==="across"?item.answer.length-1:0)));
  const shifted=placed.map(item=>({...item,row:item.row-minRow,col:item.col-minCol}));
  const startKeys=[...new Set(shifted.map(item=>keyOf(item.row,item.col)))].sort((a,b)=>{
    const [ar,ac]=a.split(":").map(Number),[br,bc]=b.split(":").map(Number);
    return ar-br||ac-bc;
  });
  const numberMap=new Map(startKeys.map((key,index)=>[key,index+1]));
  const finalEntries:CrosswordEntry[]=shifted.map(item=>({...item,number:numberMap.get(keyOf(item.row,item.col))!}));
  const cells:Record<string,CrosswordCell>={};
  finalEntries.forEach(entry=>{
    const dr=entry.direction==="down"?1:0,dc=entry.direction==="across"?1:0;
    entry.answer.split("").forEach((char,i)=>{
      const row=entry.row+dr*i,col=entry.col+dc*i,key=keyOf(row,col);
      cells[key]={answer:char,number:numberMap.get(key)};
    });
  });
  return {rows:maxRow-minRow+1,cols:maxCol-minCol+1,entries:finalEntries,cells};
}

function makeCrosswordPuzzle(mode:BrainFitMode):CrosswordPuzzle{
  const target=mode==="relaxed"?4:mode==="normal"?6:8;
  for(let attempt=0;attempt<70;attempt++){
    const puzzle=buildCrossword(shuffled(CROSSWORD_POOL),target);
    if(puzzle&&puzzle.entries.length>=target) return puzzle;
  }
  const fallback=buildCrossword(shuffled(CROSSWORD_POOL),Math.min(4,target));
  if(fallback) return fallback;
  const first=CROSSWORD_POOL[0];
  const answer=normalizeAnswer(first?.answer??"DENKEN");
  const clue=first?.clue??"Aktiv den Kopf benutzen";
  const cells:Record<string,CrosswordCell>={};
  answer.split("").forEach((char,index)=>{cells[keyOf(0,index)]={answer:char,number:index===0?1:undefined};});
  return {rows:1,cols:answer.length,entries:[{id:0,number:1,clue,answer,row:0,col:0,direction:"across"}],cells};
}

function isStraightContiguous(indices:number[]){
  if(indices.length<2) return true;
  const coords=indices.map(index=>[Math.floor(index/WORD_GRID_SIZE),index%WORD_GRID_SIZE] as const);
  const dr=coords[1][0]-coords[0][0],dc=coords[1][1]-coords[0][1];
  if(Math.max(Math.abs(dr),Math.abs(dc))!==1) return false;
  for(let i=2;i<coords.length;i++) if(coords[i][0]-coords[i-1][0]!==dr||coords[i][1]-coords[i-1][1]!==dc) return false;
  return true;
}

const initialRecorded:Record<BrainFitArea,boolean>={sudoku:false,words:false,crossword:false,memory:false,categories:false,sequence:false,everydayMath:false,timeOrder:false};

export function BrainFitTraining(){
  const [mode,setMode]=useState<BrainFitMode>("relaxed");
  const [adaptive,setAdaptive]=useState(true);
  const [area,setArea]=useState<BrainFitArea>("sudoku");
  const [stats,setStats]=useState<BrainFitStats>(()=>emptyBrainFitStats());
  const [recorded,setRecorded]=useState(initialRecorded);
  const effectiveMode=adaptive?adaptiveMode(stats,area):mode;

  const [sudokuRound,setSudokuRound]=useState<SudokuRound>(()=>makeSudokuRound("relaxed"));
  const [activeSudoku,setActiveSudoku]=useState<number|null>(null);
  const [wordPuzzle,setWordPuzzle]=useState<WordPuzzle>(()=>makeWordPuzzle(WORD_SETS[0]));
  const [selectedCells,setSelectedCells]=useState<number[]>([]);
  const [foundWords,setFoundWords]=useState<string[]>([]);
  const [crossword,setCrossword]=useState<CrosswordPuzzle>(()=>makeCrosswordPuzzle("relaxed"));
  const [crossValues,setCrossValues]=useState<Record<string,string>>({});
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

  const sudokuDone=useMemo(()=>sudokuRound.cells.every((cell,index)=>cell.value===sudokuRound.solution[index]),[sudokuRound]);
  const wordDone=wordPuzzle.words.length>0&&foundWords.length===wordPuzzle.words.length;
  const crosswordDone=useMemo(()=>Object.entries(crossword.cells).every(([key,cell])=>normalizeAnswer(crossValues[key]??"")===cell.answer),[crossword,crossValues]);
  const memoryDone=memory.length>0&&memory.every(card=>card.matched);
  const areaInfo=BRAIN_FIT_AREAS.find(item=>item.id===area)!;
  const average=overallAverage(stats);
  const trainedAreas=BRAIN_FIT_AREAS.filter(item=>stats.areaStats[item.id].sessions>0).length;

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

  function switchArea(next:BrainFitArea){setArea(next);setMessage("");prepareQuiz(next);}

  function resetArea(){
    setMessage("");setRecorded(current=>({...current,[area]:false}));
    const level=modeFor(area);
    if(area==="sudoku"){setSudokuRound(makeSudokuRound(level));setActiveSudoku(null);}
    if(area==="words"){const next=shuffled(WORD_SETS)[0];setWordPuzzle(makeWordPuzzle(next));setSelectedCells([]);setFoundWords([]);}
    if(area==="crossword"){setCrossword(makeCrosswordPuzzle(level));setCrossValues({});}
    if(area==="memory"){setMemory(makeMemory(level));setOpenCards([]);}
    prepareQuiz(area);
  }

  function setSudokuValue(value:string){
    if(activeSudoku===null||sudokuRound.cells[activeSudoku].fixed)return;
    setSudokuRound(current=>({...current,cells:current.cells.map((cell,index)=>index===activeSudoku?{...cell,value}:cell)}));
  }

  function toggleWordCell(index:number){
    setMessage("");
    if(selectedCells.length&&selectedCells[selectedCells.length-1]===index){setSelectedCells(selectedCells.slice(0,-1));return;}
    if(selectedCells.includes(index)){setMessage("Wähle die Buchstaben der Reihe nach in einer geraden Linie.");return;}
    const next=[...selectedCells,index];
    if(!isStraightContiguous(next)){setMessage("Die Wortsuche funktioniert nur waagrecht, senkrecht oder diagonal ohne Sprünge.");return;}
    setSelectedCells(next);
  }

  function checkWordSelection(){
    if(!selectedCells.length){setMessage("Markiere zuerst zusammenhängende Buchstaben im Raster.");return;}
    if(!isStraightContiguous(selectedCells)){setMessage("Die Auswahl muss eine gerade, zusammenhängende Linie bilden.");return;}
    const letters=selectedCells.map(index=>wordPuzzle.grid[Math.floor(index/WORD_GRID_SIZE)][index%WORD_GRID_SIZE]).join("");
    const reverse=letters.split("").reverse().join("");
    const match=wordPuzzle.words.find(word=>word===letters||word===reverse);
    if(match){setFoundWords(current=>current.includes(match)?current:[...current,match]);setMessage(`Gefunden: ${match} ✓`);}else setMessage("Diese gerade Auswahl ist noch kein gesuchtes Wort.");
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
  function answerQuiz(option:string){if(!currentTask||quizSelected)return;setQuizSelected(option);if(option===currentTask.answer)setQuizCorrect(value=>value+1);}
  function nextQuiz(){
    if(!currentTask||!quizSelected)return;
    if(quizIndex<quizTasks.length-1){setQuizIndex(value=>value+1);setQuizSelected(null);return;}
    const score=Math.round((quizCorrect/quizTasks.length)*100);
    setQuizComplete(true);saveResult(area,score);
  }

  const modeText=effectiveMode==="relaxed"?"Entspannt · kein Zeitdruck · mehr Vorgaben und längere Anzeige":effectiveMode==="normal"?"Normal · ausgewogene Schwierigkeit und klare Hinweise":"Herausforderung · weniger Vorgaben und kompaktere Unterstützung";

  return <section className={styles.shell} aria-labelledby="brainfit-title">
    <div className={styles.hero}>
      <p className="eyebrow">Gehirnfit & Alltag</p>
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
      <div><p className="eyebrow">Dein Gehirnfit-Profil</p><h2 id="brainfit-progress-title">Fortschritt ohne Leistungsdruck.</h2><p>Die Werte bleiben lokal in diesem Browser und helfen dabei, die adaptive Schwierigkeit nachvollziehbar anzupassen.</p></div>
      <div className={styles.metrics}><div><span>Sessions</span><strong>{stats.sessions}</strong></div><div><span>Ø Ergebnis</span><strong>{stats.sessions?`${average}%`:"–"}</strong></div><div><span>Trainiert</span><strong>{trainedAreas}/8 Bereiche</strong></div></div>
    </section>

    <div className={styles.tabs} role="tablist" aria-label="Gehirnfit Übungen">
      {BRAIN_FIT_AREAS.map(item=><button key={item.id} role="tab" aria-selected={area===item.id} onClick={()=>switchArea(item.id)}>{item.icon} {item.title}</button>)}
    </div>

    <div className={styles.panel}>
      <div className={styles.areaMeta}><span>{areaInfo.subtitle}</span><span>{stats.areaStats[area].sessions?`${areaAverage(stats.areaStats[area])}% Ø · ${stats.areaStats[area].sessions} Sessions`:"Noch untrainiert"}</span></div>

      {area==="sudoku"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Rätsel</p><h2>Tier-Sudoku 4×4</h2><p>Jedes Tier darf in jeder Zeile, Spalte und jedem markierten 2×2-Bereich nur einmal vorkommen. Jede neue Variante verwendet eine neu gemischte gültige Lösung.</p></div><span className={styles.status}>{sudokuDone?"Gelöst ✓":effectiveMode}</span></div>
        <div className={`${styles.sudoku} bfSudokuGrid`}>{sudokuRound.cells.map((cell,index)=><button key={index} type="button" data-fixed={cell.fixed} aria-label={`Feld ${index+1}${cell.value?`, ${cell.value}`:""}`} onClick={()=>!cell.fixed&&setActiveSudoku(index)} style={activeSudoku===index?{outline:"4px solid #18b696",outlineOffset:"2px"}:undefined}>{cell.value||"·"}</button>)}</div>
        <div className={styles.palette}>{ANIMALS.map(animal=><button key={animal} type="button" onClick={()=>setSudokuValue(animal)} aria-label={`${animal} einsetzen`}>{animal}</button>)}<button type="button" onClick={()=>setSudokuValue("")} aria-label="Feld leeren">×</button></div>
        {sudokuDone&&<div className={styles.success}>Sehr gut – das Tier-Sudoku ist vollständig gelöst. ✓</div>}
      </>}

      {area==="words"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Wörter</p><h2>Wörter im Raster finden</h2><p>Finde Wörter waagrecht, senkrecht, diagonal oder rückwärts. Die Buchstaben müssen direkt zusammenhängen und eine gerade Linie bilden.</p></div><span className={styles.status}>{foundWords.length}/{wordPuzzle.words.length} gefunden</span></div>
        <div className={styles.wordLayout}><div className={styles.wordGridWrap}><div className={styles.wordGrid}>{wordPuzzle.grid.flat().map((letter,index)=><button key={index} type="button" className={styles.wordCell} data-selected={selectedCells.includes(index)} onClick={()=>toggleWordCell(index)}>{letter}</button>)}</div></div><div className={styles.wordList}><strong>Gesuchte Wörter</strong>{wordPuzzle.words.map(word=><span key={word} data-found={foundWords.includes(word)}>{word}</span>)}</div></div>
        <div className={styles.actions}><button className={styles.primary} type="button" onClick={checkWordSelection}>Auswahl prüfen</button><button className={styles.secondary} type="button" onClick={()=>setSelectedCells([])}>Auswahl löschen</button></div>
        {wordDone&&<div className={styles.success}>Alle Wörter gefunden. ✓</div>}
      </>}

      {area==="crossword"&&<>
        <div className={styles.panelHead}><div><p className="eyebrow">Sprache & Wissen</p><h2>Kreuzworträtsel</h2><p>Die Begriffe kreuzen sich jetzt wirklich im Raster. Trage pro Feld einen Buchstaben ein; gemeinsame Buchstaben gehören zu mehreren Begriffen.</p></div><span className={styles.status}>{crosswordDone?"Gelöst ✓":`${crossword.entries.length} Begriffe`}</span></div>
        <div className="bfCrosswordLayout">
          <div className="bfCrosswordWrap"><div className="bfCrosswordGrid" style={{gridTemplateColumns:`repeat(${crossword.cols}, minmax(38px,1fr))`}}>
            {Array.from({length:crossword.rows*crossword.cols},(_,index)=>{const row=Math.floor(index/crossword.cols),col=index%crossword.cols,key=keyOf(row,col),cell=crossword.cells[key];return cell?<label key={key} className="bfCrosswordCell">{cell.number&&<span>{cell.number}</span>}<input aria-label={`Kreuzworträtsel Feld ${row+1}, ${col+1}`} maxLength={1} value={crossValues[key]??""} onChange={event=>setCrossValues(current=>({...current,[key]:normalizeAnswer(event.target.value).slice(-1)}))}/></label>:<span key={key} className="bfCrosswordBlock" aria-hidden="true"/>})}
          </div></div>
          <div className="bfCrosswordClues">
            <section><h3>Waagrecht</h3>{crossword.entries.filter(entry=>entry.direction==="across").map(entry=><p key={entry.id}><strong>{entry.number}.</strong> {entry.clue}</p>)}</section>
            <section><h3>Senkrecht</h3>{crossword.entries.filter(entry=>entry.direction==="down").map(entry=><p key={entry.id}><strong>{entry.number}.</strong> {entry.clue}</p>)}</section>
          </div>
        </div>
        <div className={styles.actions}><button className={styles.primary} type="button" onClick={()=>setMessage(crosswordDone?"Das Kreuzworträtsel ist vollständig richtig. ✓":"Noch sind nicht alle Kreuzungen richtig. Prüfe die gemeinsamen Buchstaben.")}>Raster prüfen</button></div>
        {crosswordDone&&<div className={styles.success}>Geschafft – alle Begriffe und Kreuzungen stimmen. ✓</div>}
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
        {quizComplete&&<div className={styles.quizResult}><strong>{Math.round((quizCorrect/quizTasks.length)*100)}%</strong><h3>Einheit abgeschlossen.</h3><p>{quizCorrect} von {quizTasks.length} Aufgaben richtig. Der Wert fließt in die adaptive Schwierigkeit ein.</p></div>}
      </>}

      {message&&<div className={styles.hint} role="status">{message}</div>}
      <div className={styles.actions}><button className={styles.secondary} type="button" onClick={resetArea}>Neue Variante</button></div>
    </div>

    <p className={styles.note}>Gehirnfit & Alltag ist ein Lern- und Übungsangebot. Es stellt keine medizinische Diagnose, Behandlung oder Aussage über kognitive Erkrankungen dar.</p>
  </section>;
}
