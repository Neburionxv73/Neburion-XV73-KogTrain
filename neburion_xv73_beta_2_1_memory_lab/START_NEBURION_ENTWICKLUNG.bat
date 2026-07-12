@echo off
setlocal
cd /d "%~dp0"
title Neburion XV73 Entwicklungsmodus

where node >nul 2>&1
if errorlevel 1 (
  echo [FEHLER] Node.js fehlt. Bitte die LTS-Version von https://nodejs.org installieren.
  pause
  exit /b 1
)

if not exist "node_modules" call npm install
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"
call npm run dev
endlocal
