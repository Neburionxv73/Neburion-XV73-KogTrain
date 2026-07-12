# Neburion XV73 Beta 2.0 – Architektur

## Engines
- Cognitive Engine: Übungsmodelle, Schwierigkeitslogik, Ergebnisformat.
- Experience Engine: Designsystem, Layout, Interaktionen und Barrierefreiheit.
- Progress Engine: lokale Speicherung, Statistiken und spätere Migrationen.
- Coach Engine: nachvollziehbare Empfehlungen auf Basis realer Trainingsdaten.

## Entwicklungsregel
Neue Übungen verwenden immer `TrainingResult`, speichern über die Progress Engine und formulieren Feedback ohne Diagnose oder Heilversprechen.
