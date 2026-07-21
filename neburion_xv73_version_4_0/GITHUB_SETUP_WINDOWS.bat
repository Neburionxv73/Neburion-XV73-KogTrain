@echo off
setlocal
where git >nul 2>nul || (
  echo Git wurde nicht gefunden. Bitte Git installieren und danach erneut starten.
  pause
  exit /b 1
)
if not exist .git git init
git add .
git commit -m "Neburion XV73 Beta 2.0 Product Studio Foundation"
git branch -M main
echo.
echo Lokales Git-Repository wurde vorbereitet.
echo Danach laut docs\DEPLOYMENT.md die GitHub-Repository-URL verbinden.
pause
