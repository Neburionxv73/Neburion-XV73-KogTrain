# Architektur — V6.5

## Zielbild
Modulare Trainingsplattform mit klarer Trennung zwischen UI, Trainingslogik, Session-State, Progression, Empfehlungen und Persistenz.

## Geplante Schichten
- UI / Presentation
- Exercise Components
- Session Engine
- Progress & Goal Engine
- Recommendation Engine
- Local Persistence
- PWA / Offline Layer
- Validation / QA Layer

## Architekturregel
Keine Trainingswelt darf ihren eigenen isolierten Session- oder Progress-Stack duplizieren. Gemeinsame Plattformlogik wird zentralisiert und wiederverwendet.
