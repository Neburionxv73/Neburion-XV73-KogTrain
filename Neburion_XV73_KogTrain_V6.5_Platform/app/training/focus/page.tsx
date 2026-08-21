import Link from "next/link";
import { FocusTraining } from "@/components/FocusTraining";

export default function FocusTrainingPage(){
  return <main className="trainingPage"><div className="trainingTopbar"><Link className="backLink" href="/">← Zur Plattform</Link><span>Learning & Training Expansion 3.0</span></div><FocusTraining /></main>;
}
