export function LabViewportStyle() {
  return (
    <style>{`
      .labPage .trainingTopbar {
        position: sticky;
        top: 0;
        z-index: 20;
        background: color-mix(in srgb, var(--bg) 94%, transparent);
        backdrop-filter: blur(18px);
      }
      .labPage .trainingShell {
        padding-top: clamp(64px, 7vw, 92px);
      }
      .labPage .trainingIntro {
        scroll-margin-top: 104px;
        margin-bottom: 44px;
      }
      .labPage .trainingIntro h1 {
        max-width: 920px;
        line-height: .98;
        text-wrap: balance;
      }
      .labPage .trainingIntro > p:last-child {
        margin-bottom: 0;
      }
      .labPage .trainingDisclaimer {
        margin-top: 22px;
        line-height: 1.65;
      }
      .labPage .trainingShell > * + .trainingDisclaimer {
        margin-top: 22px;
      }
      @media (max-width: 1024px) {
        .labPage .trainingShell { padding-top: 64px; }
        .labPage .trainingIntro { scroll-margin-top: 92px; margin-bottom: 38px; }
        .labPage .trainingIntro h1 { line-height: 1.02; }
      }
      @media (max-width: 640px) {
        .labPage .trainingTopbar { min-height: 68px; }
        .labPage .trainingShell { padding-top: 48px; padding-bottom: 76px; }
        .labPage .trainingIntro { scroll-margin-top: 82px; margin-bottom: 32px; }
        .labPage .trainingIntro h1 { line-height: 1.06; }
        .labPage .trainingDisclaimer { margin-top: 18px; }
      }
    `}</style>
  );
}
