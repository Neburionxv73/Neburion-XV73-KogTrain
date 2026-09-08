import type { Metadata } from "next";
import { ProfilePageContent } from "@/components/ProfilePageContent";
import "./profile-v12.css";

export const metadata: Metadata = {
  title: "Spielerprofile / Player Profiles · KogTrain V12",
  description: "Eigene Spielerprofile mit getrennten Lernständen, XP und Trainingsfortschritten verwalten / Manage separate player profiles, XP and training progress.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfilePageContent />;
}
