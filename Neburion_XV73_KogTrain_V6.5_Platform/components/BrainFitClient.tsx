"use client";

import dynamic from "next/dynamic";
import { BrainFitEnglishBridge } from "./BrainFitEnglishBridge";
import { usePlatformLanguage } from "./PlatformLanguageProvider";
import { applyBrainFitLanguageData } from "@/lib/brainFitLocaleData";

const BrainFitTraining = dynamic(() => import("./BrainFitTraining").then((module) => module.BrainFitTraining), { ssr: false });
const BrainFitAdaptiveV5 = dynamic(() => import("./BrainFitAdaptiveV5").then((module) => module.BrainFitAdaptiveV5), { ssr: false });
const BrainFitCompletionPanel = dynamic(() => import("./BrainFitCompletionPanel").then((module) => module.BrainFitCompletionPanel), { ssr: false });
const UnifiedTrainingCoach = dynamic(() => import("./UnifiedTrainingCoach").then((module) => module.UnifiedTrainingCoach), { ssr: false });

export function BrainFitClient() {
  const { language } = usePlatformLanguage();
  applyBrainFitLanguageData(language);
  return <BrainFitEnglishBridge key={language}><BrainFitTraining key={`brainfit-training-${language}`} /><BrainFitAdaptiveV5 key={`brainfit-adaptive-${language}`} /><BrainFitCompletionPanel /><UnifiedTrainingCoach /></BrainFitEnglishBridge>;
}
