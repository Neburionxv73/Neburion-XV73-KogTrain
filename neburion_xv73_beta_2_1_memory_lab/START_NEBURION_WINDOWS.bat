@echo off
setlocal
cd /d "%~dp0"
title Neburion XV73 Beta 2.3

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo [FEHLER] Node.js ist nicht installiert.
  echo Bitte installiere zuerst die aktuelle LTS-Version von https://nodejs.org
  echo Danach diese Datei erneut doppelklicken.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installiere die benoetigten Programmdateien...
  call npm install
  if errorlevel 1 (
    echo.
    echo [FEHLER] Die Installation ist fehlgeschlagen.
    pause
    exit /b 1
  )
)

if not exist ".next\BUILD_ID" (
  echo Erstelle den lokalen Produktions-Build...
  call npm run build
  if errorlevel 1 (
    echo.
    echo [FEHLER] Der Build ist fehlgeschlagen.
    pause
    exit /b 1
  )
)

echo.
echo Neburion XV73 wird lokal gestartet...
echo Lokaler Link: http://localhost:3000
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"
call npm run start

endlocal
