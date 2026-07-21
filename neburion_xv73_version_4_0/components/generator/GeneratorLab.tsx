"use client";
import { useMemo, useState } from "react";
import { generateExerciseSet } from "@/features/exercise-generator";

export function GeneratorLab(){
 const [seed,setSeed]=useState(()=>Number(new Date().toISOString().slice(0,10).replaceAll("-","")));
 const exercises=useMemo(()=>generateExerciseSet(seed,10),[seed]);
 return <main className="generator-page">
  <section className="panel generator-hero"><div><span className="eyebrow">Beta 3.7 · Content Expansion</span><h1>Kontrollierte Übungsvielfalt statt Wiederholung.</h1><p className="lead">Der Generator erstellt nachvollziehbare Varianten für Logik, Mathematik, Sprache, visuelle Wahrnehmung und Aufmerksamkeit. Jede Variante bleibt fachlich prüfbar und besitzt eine feste Lösung.</p></div><button className="btn btn-primary" onClick={()=>setSeed(Date.now()%100000000)}>Neue Varianten erzeugen</button></section>
  <section className="generator-grid">{exercises.map((exercise,index)=><article className="generator-card" key={exercise.id}><span>{String(index+1).padStart(2,"0")} · {exercise.category}</span><h2>{exercise.title}</h2><p>{exercise.prompt}</p><small>{exercise.domain} · {exercise.difficulty} · ca. {exercise.estimatedSeconds} Sek.</small></article>)}</section>
  <section className="panel generator-note"><h2>Kontrollierte Generierung</h2><p>Die Aufgaben entstehen deterministisch aus einem Seed. Dadurch sind Varianten reproduzierbar, Lösungen eindeutig und Qualitätsprüfungen möglich. Freie, unkontrollierte KI-Inhalte werden nicht verwendet.</p></section>
 </main>
}
