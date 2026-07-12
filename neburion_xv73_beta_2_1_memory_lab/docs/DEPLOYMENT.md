# Deployment: GitHub + Vercel

## 1. GitHub-Repository anlegen

1. Auf GitHub ein neues leeres Repository `neburion-xv73` erstellen.
2. Projektordner in Git initialisieren:

```bash
git init
git add .
git commit -m "Neburion XV73 Beta 2.0 Sprint 0"
git branch -M main
git remote add origin <DEINE-GITHUB-REPOSITORY-URL>
git push -u origin main
```

3. Optional einen Beta-Zweig anlegen:

```bash
git checkout -b beta
git push -u origin beta
```

## 2. Vercel verbinden

1. Bei Vercel anmelden.
2. `Add New Project` auswählen.
3. Das GitHub-Repository importieren.
4. Framework wird automatisch als Next.js erkannt.
5. `Deploy` auswählen.

Danach entsteht eine HTTPS-Testadresse. Jeder Push auf den verbundenen Zweig erzeugt automatisch eine neue Bereitstellung.

## 3. Empfohlene Umgebungen

- `main`: stabile Testversion
- `beta`: neue Beta-Funktionen
- `feature/*`: einzelne Sprints und Experimente

## 4. Vor jedem Release

```bash
npm ci
npm run release:check
```
