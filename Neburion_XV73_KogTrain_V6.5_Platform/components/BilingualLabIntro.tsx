"use client";

import { usePlatformLanguage } from "./PlatformLanguageProvider";

export function BilingualLabIntro({
  eyebrow,
  titleDe,
  titleEn,
  bodyDe,
  bodyEn,
  titleId,
}: {
  eyebrow: string;
  titleDe: string;
  titleEn: string;
  bodyDe: string;
  bodyEn: string;
  titleId?: string;
}) {
  const { pick } = usePlatformLanguage();
  return <header className="trainingIntro">
    <p className="eyebrow">{eyebrow}</p>
    <h1 id={titleId}>{pick(titleDe, titleEn)}</h1>
    <p>{pick(bodyDe, bodyEn)}</p>
  </header>;
}

export function BilingualTrainingDisclaimer() {
  const { pick } = usePlatformLanguage();
  return <p className="trainingDisclaimer">{pick(
    "Dieses Training dient Lern- und Übungszwecken und stellt keine medizinische Diagnose oder Behandlung dar.",
    "This training is intended for learning and practice and does not constitute medical diagnosis or treatment.",
  )}</p>;
}
