@echo off
REM @author: fatima bashir
REM GinaAI Production Server Startup Script for Windows

echo Starting GinaAI Production Servers...
echo.

echo Building frontend...
cd frontend
npm run build
cd ..

echo.
echo Starting servers...
echo Backend will run on http://localhost:5000
echo Frontend will be served from backend on http://localhost:5000
echo.

start "GinaAI Backend" cmd /k "cd backend && npm start"

echo.
echo Production server is starting...
echo Press any key to exit this window.
pause >nul 