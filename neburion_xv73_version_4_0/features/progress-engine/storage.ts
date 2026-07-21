"use client";
import type { TrainingResult } from "@/features/cognitive-engine/types";
const KEY="neburion.trainingResults.v2";
export function loadResults():TrainingResult[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
export function saveResult(result:TrainingResult){const next=[result,...loadResults()].slice(0,500);localStorage.setItem(KEY,JSON.stringify(next));return next}
