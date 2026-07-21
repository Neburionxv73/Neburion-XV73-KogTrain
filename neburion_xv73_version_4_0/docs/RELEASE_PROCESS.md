# Release-Prozess

## Kanäle

- **Feature:** isolierte Entwicklung.
- **Beta:** interne Prüfung und mobile Tests.
- **Stable:** bestätigte, dokumentierte Version.

## Release-Gate

1. Versionsnummer aktualisieren.
2. Release Notes ergänzen.
3. `npm run validate` ausführen.
4. `npm run build` ausführen.
5. Exercise Runner manuell testen.
6. Desktop, Tablet und Mobil prüfen.
7. Erst danach Tag oder Stable-Deployment erstellen.


## Version 4.0 Stable Release

Vor dem Deployment `npm ci` und `npm run quality:full` ausführen. Erst nach erfolgreichem Quality Gate committen und nach GitHub pushen. Vercel übernimmt anschließend den Produktions-Build.
