@echo off
title Healthcare Management System

echo ==================================
echo Healthcare Management System
echo ==================================
echo.

REM Check if virtual environment exists
if not exist ".venv" (
    echo Error: Virtual environment not found. Please create one first.
    pause
    exit /b 1
)

REM Check if node_modules exists in frontend
if not exist "frontend\node_modules" (
    echo Error: Frontend dependencies not installed.
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo Starting Flask backend...
start "Flask Backend" cmd /k "call .venv\Scripts\activate && python app.py"

timeout /t 3 /nobreak > nul

echo Starting React frontend...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==================================
echo Servers are running!
echo ==================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Close the terminal windows to stop the servers
echo ==================================
echo.

pause
