# Neburion XV73 – Version 4.0

## Platform Release – Strength-Based Cognitive Training

Neburion XV73 ist eine local-first kognitive Trainingsplattform mit fünf Trainingswelten:

- Memory Lab
- Attention Lab
- Logic Lab
- Language Lab
- Visual Lab

Hinzu kommen ein einheitliches Session-System, ein stärkenorientierter Coach, transparente adaptive Empfehlungen, Fortschritt, Wochenziele, Meilensteine, Profil- und Backupfunktionen sowie PWA-/Offline-Unterstützung.

## Lokal entwickeln

```bash
npm ci
npm run dev
```

Danach `http://localhost:3000` öffnen.

## Vollständige Qualitätsprüfung

```bash
npm run quality:full
```

Diese Prüfung umfasst TypeScript, Projekt- und Integrationsvalidierung, Release-Gate, Produktions-Build und HTTP-Smoke-Test.

## Deployment

Die Plattform ist für GitHub und Vercel vorbereitet. Hinweise stehen in `docs/DEPLOYMENT.md` und `docs/RELEASE_PROCESS.md`.

## Verantwortung

Neburion XV73 ist ein Trainings- und Lernsystem. Es stellt keine medizinische Diagnose, verspricht keine Heilung und ersetzt keine medizinische oder therapeutische Behandlung. Trainingsdaten bleiben standardmäßig lokal im Browser.

Aktueller Versionsstand: **4.0.0 – stable**
