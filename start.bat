@echo off
echo ========================================
echo   SpecMate AI - Starting...
echo ========================================
echo.

:: Start backend
echo [1/2] Starting Backend (port 3001)...
cd /d "%~dp0backend"
start "SpecMate-Backend" cmd /c "node server.js"

:: Start frontend
echo [2/2] Starting Frontend (port 5173)...
cd /d "%~dp0frontend"
start "SpecMate-Frontend" cmd /c "npx vite"

echo.
echo ========================================
echo   SpecMate AI Started!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo ========================================
echo.
echo Press any key to stop both servers...
pause > nul

:: Kill servers
taskkill /FI "WINDOWTITLE eq SpecMate-Backend" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq SpecMate-Frontend" /F > nul 2>&1
echo Servers stopped.
