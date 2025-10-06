@echo off
echo Starting AI CV Builder Development Environment...

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"

echo.
echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd client && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
