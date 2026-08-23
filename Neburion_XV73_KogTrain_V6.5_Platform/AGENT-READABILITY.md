# KogTrain V6.5 — Agent Readability Map

Purpose: machine- and reviewer-readable orientation for the V6.5 release candidate.

## Release identity
- Product: Neburion XV73 KogTrain
- Version: 6.5.0
- Branch: `dev/v6.5-platform`
- App root: `Neburion_XV73_KogTrain_V6.5_Platform`
- Deployment target: Vercel project `neburion-xv-73-kog-train`

## Primary routes
- `/` — dashboard, learning areas, specialist labs, Gehirnfit entry, progress overview
- `/training/journey` — unified training entry
- `/training/focus` — personal focus selection
- `/training/memory` — Memory Lab
- `/training/attention` — Attention Lab
- `/training/logic` — Logic Lab
- `/training/language` — Language Lab
- `/training/visual` — Visual Lab
- `/training/brain-fit` — Gehirnfit & Alltag

## Primary implementation modules
- `app/layout.tsx` — global metadata, style layers, skip navigation
- `app/page.tsx` — dashboard composition
- `components/UnifiedTrainingJourney.tsx` — training entry flow
- `components/ProgressCoachDashboard.tsx` — progress and goals overview
- `components/BrainFitTraining.tsx` — core BrainFit interaction logic
- `lib/brainFit.ts` — BrainFit content, modes and scoring helpers
- `lib/progress.ts` — cross-lab progress aggregation
- `scripts/validate-brainfit.mjs` — BrainFit/static QA gate

## Storage
- BrainFit key: `neburion-v65-brain-fit-v372`
- Additional lab/progress keys are aggregated in `lib/progress.ts`.
- Storage is local to the browser origin/domain; Vercel preview URLs do not share the same localStorage namespace.

## Interaction model
- Buttons and tabs are keyboard focusable.
- Global `:focus-visible` treatment is loaded through `interaction-finish-v97.css`.
- Skip navigation points to the dashboard main landmark.
- Reduced-motion rules are present in the global and BrainFit style layers.

## Deliberate exclusions
- No automatic recommendation panel/CTA in the visible release-candidate UI.
- No authentication/account system in V6.5 scope.
- No server-side personal profile or health data model in V6.5 scope.
- No medical diagnosis/treatment functionality.

## Validation commands
- `npm run typecheck`
- `npm run validate`
- `npm run quality:core`

## Gate caution
This map improves agent readability but is not itself proof of visual, performance, security or accessibility conformance. Those gates require their own evidence.
