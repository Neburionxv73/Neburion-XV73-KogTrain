"use client";

import dynamic from "next/dynamic";

const BrainFitTraining = dynamic(
  () => import("./BrainFitTraining").then((module) => module.BrainFitTraining),
  { ssr: false },
);

const BrainFitCompletionPanel = dynamic(
  () => import("./BrainFitCompletionPanel").then((module) => module.BrainFitCompletionPanel),
  { ssr: false },
);

const UnifiedTrainingCoach = dynamic(
  () => import("./UnifiedTrainingCoach").then((module) => module.UnifiedTrainingCoach),
  { ssr: false },
);

export function BrainFitClient() {
  return (
    <>
      <BrainFitTraining />
      <BrainFitCompletionPanel />
      <UnifiedTrainingCoach />
    </>
  );
}
