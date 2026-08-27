# Raptor Delta V10.3 — KogTrain Specialist Hard Mode Review

Branch: `dev/v6.5-platform`
Policy: **NO EVIDENCE → NO PASS → NO RELEASE**
Candidate: KogTrain V6.6 / V10.3 Specialist Foundation

## Hard Mode design decision
The platform is no longer treated as a generic dashboard redesign. The current design standard is a specialist learning-platform system with disciplined typography, semantic color roles, clear chapter hierarchy and responsive recomposition.

### Typography contract
- Display/H1 desktop maximum: 88 px through `--k-display: clamp(58px, 6.7vw, 88px)`.
- H2 desktop maximum: 56 px.
- H3: 25–32 px.
- Lead: 20 px desktop.
- Body: 17 px desktop, 16 px phone.
- Headline line-height never below 1.02 in the current foundation.
- Headline measure constrained by character width to reduce collisions and poor wraps.

### Color contract
Primary roles are semantic rather than decorative:
- Navy: brand, orientation, primary CTA.
- Blue: interaction and navigation.
- Teal: learning/progress accent.
- Coral: selective warm contrast.
- Gold: calm emphasis.
- Violet: limited specialist accent.
- Neutral grey/white foundation dominates the overall interface.
- Dark styling is reserved primarily for the progress/system stage.

### Platform structure
1. Training start
2. Personal learning mix
3. Specialist labs
4. BrainFit & everyday training
5. Progress system

The information hierarchy is intended to be understandable before visual decoration. Existing public routes and training engines remain unchanged by this design pass.

## Hard Mode validator
`scripts/validate-v103-redesign.mjs` now checks:
- exactly one V10.3 stylesheet import;
- no legacy redesign/collision layers;
- controlled headline scale and line-height;
- semantic palette tokens;
- page hierarchy and public training routes;
- desktop/tablet/mobile recomposition;
- phone body-size floor;
- touch-target baseline;
- reduced-motion support;
- skip link, German document language, robots policy;
- V6.6 product identity;
- V9.7 not presented as the current visual standard.

## Gate state
- SPEC: PASS baseline retained.
- BUILD: REVALIDATE on newest exact head.
- RESPONSIVE: SOURCE PASS / rendered evidence required.
- A11Y: SOURCE PARTIAL+ / runtime Lighthouse and keyboard evidence required.
- PERFORMANCE: REVALIDATE after visual changes.
- SEO: implementation retained / runtime revalidation required.
- VISUAL_QA: REVALIDATE on rendered Desktop, Tablet, Smartphone.
- REVIEW: Specialist source review complete; independent rendered review remains open.
- RELEASE: HOLD.

## Decision
**V10.3 SPECIALIST HARD MODE CANDIDATE — NOT YET STABLE / NOT READY FOR MAIN.**

`main` remains untouched. No pull request or production-stable declaration is authorized by this document.