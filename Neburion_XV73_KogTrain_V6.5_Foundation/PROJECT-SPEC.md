# PROJECT-SPEC — Neburion XV73 Kognitive Trainingsplattform V6.5

spec_version: 6.5.0
standard: Raptor Delta V9.7
release_status: DRAFT

## 1. Produktziel
Weiterentwicklung einer kognitiven Trainingsplattform mit fünf Trainingswelten, einheitlichem Session-System, Coach, Fortschritt, Wochenzielen, Meilensteinen, Profil- und Backup-Funktionen sowie PWA-/Offline-Fähigkeit, soweit technisch sinnvoll.

## 2. Kernmodule
1. Memory Lab
2. Attention Lab
3. Logic Lab
4. Language Lab
5. Visual Lab
6. Session Engine
7. Adaptive Recommendation Engine
8. Progress & Goals
9. Coach Layer
10. Profile & Local Data
11. Backup / Restore
12. PWA / Offline

## 3. Rollen
- Builder: Implementierung
- Syntharion: Technical Review
- Mudrasol: Visual Review
- Neburion XV73: Creative Direction und finale kreative Freigabe

Builder darf den eigenen Build nicht freigeben.

## 4. Responsive-Profil
### Desktop
Eigenständige, informationsreiche Komposition.

### Tablet
Rekomposition von Layout, Navigation, Cards, Übungsflächen und Interaktionen.

### Smartphone
Repriorisierte Inhalte, vereinfachte Interaktion, große Touch-Ziele und reduzierte Bewegung.

Pflicht: mindestens 44×44 px Touch Targets.

## 5. Accessibility
- WCAG-AA-orientierter Kontrast
- vollständige Tastaturbedienung der Kernfunktionen
- sichtbare Fokuszustände
- semantische Struktur
- verständliche Labels und Fehlermeldungen
- `prefers-reduced-motion`

## 6. Performance
- keine unnötigen Blocker im Initial Load
- Lazy Loading für nichtkritische Medien
- Motion performant und GPU-freundlich
- keine unnötigen großen Third-Party-Abhängigkeiten

## 7. Security
- Least Privilege
- Secret Isolation
- untrusted input wird validiert
- keine Secrets im Frontend oder Repository
- kritische Aktionen benötigen explizite Freigabe
- lokale Trainingsdaten werden nicht stillschweigend extern übertragen

## 8. UX / Visual Direction
- klare Trainingshierarchie
- hochwertige, nicht generische UI
- Anti-KI-Look
- ruhige visuelle Führung statt überladener Gamification
- eindeutige Zustände für Start, Aktiv, Pause, Erfolg, Fehler und Abschluss

## 9. Acceptance Criteria
- alle fünf Trainingswelten funktionsfähig
- Session-System konsistent
- Fortschritt wird korrekt gespeichert
- adaptive Empfehlungen sind transparent erklärbar
- responsive QA für Desktop, Tablet, Smartphone bestanden
- Keyboard- und Fokus-QA bestanden
- Build ohne TypeScript-/Build-Fehler
- keine offenen TODO/TBD/Placeholder im Release
- alle blockierenden Gates PASS

## 10. Blockierende Gates
- SPEC_GATE
- BUILD_GATE
- SECURITY_GATE
- AGENT_READABILITY_GATE
- RESPONSIVE_GATE
- A11Y_GATE
- PERFORMANCE_GATE
- SEO_GATE
- VISUAL_QA_GATE
- REVIEW_GATE
- RELEASE_GATE

Regel: Ein FAIL stoppt den Release.
