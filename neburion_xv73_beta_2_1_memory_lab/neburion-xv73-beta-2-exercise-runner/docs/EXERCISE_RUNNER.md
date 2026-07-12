# Exercise Runner – Sprint 1

Der Exercise Runner ist die gemeinsame Laufzeit für Übungen in Neburion XV73.

## Aktuell unterstützt

- Single Choice
- Multiple Choice
- Reihenfolge/Sequenz
- Aufgabenserien
- Fortschrittsanzeige
- Button „Nächste Aufgabe“
- Teilbewertung bei Mehrfachauswahl
- Zeitmessung pro Aufgabe
- Strategiehinweise
- lokale Speicherung in der Progress Engine
- adaptive Empfehlung für die nächste Schwierigkeitsstufe

## Neue Übungen ergänzen

Neue Aufgaben werden in `data/exercises.ts` als strukturierte Objekte ergänzt. Die UI- und Speicherlogik muss dafür nicht neu geschrieben werden.

## Nächste Ausbaustufe

- Timer mit sichtbarem Countdown
- Drag & Drop
- Memory-Karten
- Reaktionsaufgaben
- Audio- und Bildreize
- konfigurierbare Lernpfade
- Session-Fortsetzung nach Unterbrechung
