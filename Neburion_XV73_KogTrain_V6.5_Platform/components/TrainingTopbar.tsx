"use client";

import Link from "next/link";
import { usePlatformLanguage } from "./PlatformLanguageProvider";

export function TrainingTopbar({
  href = "/",
  backDe = "Zur Plattform",
  backEn = "Back to platform",
  titleDe,
  titleEn,
}: {
  href?: string;
  backDe?: string;
  backEn?: string;
  titleDe: string;
  titleEn: string;
}) {
  const { pick } = usePlatformLanguage();
  return <div className="trainingTopbar">
    <Link className="backLink" href={href}>← {pick(backDe, backEn)}</Link>
    <span>{pick(titleDe, titleEn)}</span>
  </div>;
}
