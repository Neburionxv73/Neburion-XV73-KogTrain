# Beta 3.5 – PWA & Offline Excellence

## Ziel
Neburion XV73 lässt sich auf unterstützten Geräten wie eine App installieren, erkennt Verbindungswechsel und bietet eine kontrollierte Offline-Basis.

## Umsetzung
- Manifest mit App-ID, Scope, Shortcuts, PNG- und Maskable-Icons
- Navigation: network-first mit Offline-Rückfallseite
- Statische Assets: cache-first mit Hintergrundaktualisierung
- versionsgebundene Cache-Namen und automatische Bereinigung
- Update-Erkennung ohne erzwungenes Neuladen während einer Übung
- App-&-Offline-Statusseite mit Cachekontrolle
- lokale Trainingsdaten bleiben getrennt vom App-Cache erhalten

## Grenzen
Noch nie aufgerufene dynamische Inhalte benötigen eine Verbindung. Browser und Betriebssystem entscheiden, wann der Installationsdialog angeboten wird.
