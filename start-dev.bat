@echo off
echo 🚀 Starting GinaAI Development Servers...
echo.

echo ⏹️ Stopping any existing servers...
taskkill /F /IM node.exe >nul 2>&1

echo 🔧 Starting Backend Server (Port 5000)...
start "Backend" cmd /k "cd backend && npm run dev"

echo ⏳ Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo 🎨 Starting Frontend Server (Port 3000)...
start "Frontend" cmd /k "cd frontend && npm start"

echo ⏳ Waiting for frontend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo ✅ Both servers should be starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo 💡 Wait for both terminal windows to show "compiled successfully"
echo 🎵 Then test the mindfulness music at: http://localhost:3000/mindfulness
echo.
pause