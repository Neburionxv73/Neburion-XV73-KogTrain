import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neburion XV73 · Kognitive Trainingsplattform V6.5",
  description: "Modulare kognitive Trainingsplattform mit fünf Trainingswelten, Fortschritt und Coach.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
