"use client";

import dynamic from "next/dynamic";
import { BrainFitEnglishBridge } from "./BrainFitEnglishBridge";

const BrainFitTraining = dynamic(() => import("./BrainFitTraining").then((module) => module.BrainFitTraining), { ssr: false });
const BrainFitAdaptiveV5 = dynamic(() => import("./BrainFitAdaptiveV5").then((module) => module.BrainFitAdaptiveV5), { ssr: false });
const BrainFitCompletionPanel = dynamic(() => import("./BrainFitCompletionPanel").then((module) => module.BrainFitCompletionPanel), { ssr: false });
const UnifiedTrainingCoach = dynamic(() => import("./UnifiedTrainingCoach").then((module) => module.UnifiedTrainingCoach), { ssr: false });

export function BrainFitClient() {
  return <BrainFitEnglishBridge><BrainFitTraining /><BrainFitAdaptiveV5 /><BrainFitCompletionPanel /><UnifiedTrainingCoach /></BrainFitEnglishBridge>;
}
