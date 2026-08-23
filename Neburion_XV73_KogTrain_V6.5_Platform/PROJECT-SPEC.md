# Neburion XV73 — KogTrain V6.5 Project Spec

Status: Release-candidate preparation on `dev/v6.5-platform`.
Standard: Raptor Delta V9.7 — NO EVIDENCE → NO PASS → NO RELEASE.

## Product scope
KogTrain V6.5 is a browser-based learning and cognitive training platform. The release-candidate scope contains:

- Start/dashboard with learning areas, specialist labs, Gehirnfit & Alltag and progress overview.
- Unified training entry at `/training/journey`.
- Personal focus selection at `/training/focus`.
- Specialist labs: Memory, Attention, Logic, Language and Visual.
- Gehirnfit & Alltag at `/training/brain-fit` with Sudoku, word search, crossword, memory, categories, sequences, everyday maths and time/order exercises plus expansion content.
- Local progress, XP, goals, streak/activity and training statistics.

## Product rules
- No visible automatic recommendation UI.
- No medical diagnosis or treatment claims.
- Gehirnfit defaults to calm, accessible interaction without mandatory time pressure.
- Training results and progress remain local to the browser/domain in the current V6.5 architecture.
- Preview domains have technically separate browser storage.

## Technical baseline
- Next.js 16.2.10
- React 19.2.7
- TypeScript 5.9
- Node 24.x
- pnpm 10.13.1
- `npm run validate` performs TypeScript/project validation and BrainFit QA checks.
- Vercel project: `neburion-xv-73-kog-train`.

## Branch / release controls
- Active development branch: `dev/v6.5-platform`.
- `main` is not changed until release gates pass and a separate explicit release action is authorized.
- No force push or squash is part of this release process.

## Data and security boundary
- Current training state uses browser storage; no account, payment, health-record or server-side personal-data workflow is in this V6.5 scope.
- No critical write action is initiated from the training UI.
- Baseline HTTP response headers are configured in `next.config.ts`.
- A stricter CSP is not claimed as implemented until it is tested against the Next.js runtime.

## Responsive / accessibility requirements
- Desktop designed, Tablet recomposed, Smartphone reprioritized.
- Minimum 44×44 px interactive targets where applicable.
- Keyboard-visible focus states and skip navigation.
- Reduced-motion support.
- No final RESPONSIVE/A11Y gate PASS without rendered/device interaction evidence.

## Definition of Done
Release is permitted only when SPEC, BUILD, SECURITY, AGENT_READABILITY, RESPONSIVE, A11Y, PERFORMANCE, SEO, VISUAL_QA, REVIEW and RELEASE gates all have explicit evidence and PASS status. Build success alone is insufficient.
