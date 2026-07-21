# Neburion XV73 – Beta 3.0 Gesamtprüfung

## Ziel

Der Integrationssprint prüft die Plattform als zusammenhängendes Produkt statt nur als Sammlung einzelner Module.

## Automatisches Quality Gate

`npm run quality:full` führt nacheinander aus:

1. TypeScript-Prüfung
2. Projektstruktur-Validierung
3. erweiterte Gesamtprüfung
4. Next.js-Produktions-Build
5. HTTP-Smoke-Test aller zentralen Routen

## Build-Cache

Der GitHub-Actions-Workflow `.github/workflows/quality.yml` verwendet zwei Cache-Ebenen:

- npm-Download-Cache über `actions/setup-node`
- inkrementeller Next.js-Cache über `.next/cache`

Vercel verwaltet seinen Build-Cache zusätzlich automatisch. Der Workflow beschleunigt vor allem GitHub-Prüfungen und reproduzierbare Pull-Request-Builds.

## Geprüfte Produktbereiche

- Landingpage und Dashboard
- Trainingseinstieg
- Memory, Attention, Logic, Language und Visual Lab
- Fortschritt und Coach
- Einstellungen
- Developer Center und Product Manifest
- Manifest und Service Worker
- interne Navigation
- eindeutige Übungs-IDs
- Tastaturfokus, reduzierte Bewegung und Kontrastunterstützung
- Produktionsrouten per HTTP

## Lokaler Befehl

```bash
npm ci
npm run quality:full
```
