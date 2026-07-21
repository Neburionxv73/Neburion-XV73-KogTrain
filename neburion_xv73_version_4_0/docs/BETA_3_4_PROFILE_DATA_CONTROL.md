# Neburion XV73 Beta 3.4 – Profile & Datensicherung

## Umfang
- lokales Nutzerprofil mit Ziel, Dauer und Schwierigkeitsstufe
- Backup-Export als lesbare JSON-Datei
- Import mit Schema-, Versions- und Prüfsummenprüfung
- Wiederherstellung aller bekannten Neburion-Speicherbereiche
- vollständige lokale Datenlöschung mit Sicherheitsabfrage
- keine automatische Cloud-Übertragung

## Sicherheitsprinzip
Backups akzeptieren ausschließlich eine definierte Liste bekannter localStorage-Schlüssel. Eine FNV-1a-Prüfsumme erkennt beschädigte oder nachträglich veränderte Dateien. Importierte Daten werden erst nach vollständiger Validierung geschrieben.
