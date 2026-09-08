import type { Metadata } from "next";
import { AccountPageContent } from "@/components/AccountPageContent";
import "./account-v12.css";

export const metadata: Metadata = {
  title: "Konto & Cloud-Spielstand / Account & Cloud Save · KogTrain V12",
  description: "Privater KogTrain-Cloud-Zugang für geräteübergreifenden Lernfortschritt / Private KogTrain cloud access for cross-device learning progress.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountPageContent />;
}
