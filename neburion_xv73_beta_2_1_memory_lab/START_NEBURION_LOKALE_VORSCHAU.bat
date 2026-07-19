@echo off
setlocal
cd /d "%~dp0"
title Neburion XV73 Beta 2.3 - Lokale Vorschau

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo [FEHLER] Node.js ist nicht installiert.
  echo Bitte installiere zuerst Node.js LTS von https://nodejs.org
  echo Danach diese Datei erneut doppelklicken.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [1/3] Installiere die benoetigten Programmdateien...
  call npm install
  if errorlevel 1 goto error
)

if not exist ".next\BUILD_ID" (
  echo [2/3] Erstelle den lokalen Produktions-Build...
  call npm run build
  if errorlevel 1 goto error
)

echo [3/3] Starte Neburion XV73 unter http://localhost:3000
echo.
echo WICHTIG: Dieses Fenster waehrend der Nutzung geoeffnet lassen.
echo Zum Beenden Strg+C druecken oder dieses Fenster schliessen.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 4; Start-Process '%~dp0NEBURION_XV73_LOKALE_VORSCHAU.html'"
call npm run start
exit /b 0

:error
echo.
echo [FEHLER] Der lokale Start konnte nicht abgeschlossen werden.
echo Pruefe die Internetverbindung und versuche es erneut.
echo.
pause
exit /b 1
