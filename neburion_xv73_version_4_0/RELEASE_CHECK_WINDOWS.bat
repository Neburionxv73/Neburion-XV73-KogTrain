@echo off
setlocal
where node >nul 2>nul || (
  echo Node.js wurde nicht gefunden.
  pause
  exit /b 1
)
call npm install
if errorlevel 1 goto fail
call npm run release:check
if errorlevel 1 goto fail
echo.
echo Release-Check erfolgreich.
pause
exit /b 0
:fail
echo.
echo Release-Check fehlgeschlagen. Bitte Fehlermeldung pruefen.
pause
exit /b 1
