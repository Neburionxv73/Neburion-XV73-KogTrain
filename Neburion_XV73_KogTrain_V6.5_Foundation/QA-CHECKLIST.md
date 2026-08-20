# QA-CHECKLIST — V6.5

## SPEC_GATE
- [ ] PROJECT-SPEC vollständig
- [ ] Spec-Version gültig
- [ ] Acceptance Criteria definiert
- [ ] keine TODO/TBD vor Release

## BUILD_GATE
- [ ] Typecheck PASS
- [ ] Production Build PASS
- [ ] Smoke Test PASS

## SECURITY_GATE
- [ ] keine Secrets im Repository
- [ ] Input Validation geprüft
- [ ] Local-Data-Verhalten dokumentiert
- [ ] externe Zugriffe minimal und explizit

## AGENT_READABILITY_GATE
- [ ] Struktur und Komponenten logisch lesbar
- [ ] Benennung konsistent
- [ ] Zuständigkeiten klar
- [ ] keine unnötigen monolithischen Dateien

## RESPONSIVE_GATE
- [ ] Desktop geprüft
- [ ] Tablet rekombiniert
- [ ] Smartphone repriorisiert
- [ ] 44×44 px Touch Targets
- [ ] keine Kollisionen / abgeschnittenen Inhalte

## A11Y_GATE
- [ ] Tastaturbedienung
- [ ] Fokus sichtbar
- [ ] Kontrast AA-orientiert
- [ ] semantische Labels
- [ ] Reduced Motion

## PERFORMANCE_GATE
- [ ] Initial Load geprüft
- [ ] Assets optimiert
- [ ] Motion performant
- [ ] keine unnötigen Third-Party-Blocker

## SEO_GATE
- [ ] Title / Meta Description
- [ ] semantische Seitenstruktur
- [ ] Indexierungsstrategie dokumentiert

## VISUAL_QA_GATE
- [ ] konsistentes Designsystem
- [ ] klare Typografiehierarchie
- [ ] Trainingszustände visuell eindeutig
- [ ] kein generischer KI-/Template-Look

## REVIEW_GATE
- [ ] Syntharion Technical Review PASS
- [ ] Mudrasol Visual Review PASS
- [ ] Neburion XV73 Creative Review PASS

## RELEASE_GATE
- [ ] alle Gates PASS
- [ ] Run-ID vorhanden
- [ ] Commit-/Build-Hash dokumentiert
- [ ] Release Record vollständig
