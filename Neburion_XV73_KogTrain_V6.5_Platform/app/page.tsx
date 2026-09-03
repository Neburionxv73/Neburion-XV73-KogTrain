import type { Metadata } from "next";
import { HomeDashboardV11 } from "@/components/HomeDashboardV11";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "KogTrain V6.7 · Lernplattform Dashboard",
  description: "Persönliche Trainingsübersicht für Memory, Attention, Logic, Language, Visual und Gehirnfit mit klaren Tages- und Wochenzielen.",
};

export default function Home() {
  return <HomeDashboardV11 />;
}
