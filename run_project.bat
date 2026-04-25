@echo off
echo ==================================================
echo   Starting ProVal Real Estate Valuation Project
echo ==================================================

:: ── Kill any process already on port 8080 ────────────────────────────────
echo Checking port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo Killing process %%a on port 8080...
    taskkill /PID %%a /F >nul 2>&1
)

:: ── Kill any process already on port 5000 ────────────────────────────────
echo Checking port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process %%a on port 5000...
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 /nobreak > nul

:: ── Install Python ML dependencies ───────────────────────────────────────
echo Installing Python ML dependencies...
pip install -r ml_service\requirements.txt --quiet

:: ── Start ML Service first ────────────────────────────────────────────────
echo Starting Python ML Service on port 5000...
start cmd /k "cd ml_service && python ml_service.py"
timeout /t 4 /nobreak > nul

:: ── Start Spring Boot Backend ─────────────────────────────────────────────
echo Starting Spring Boot Backend on port 8080...
start cmd /k "cd backend\real-estate-backend && mvn spring-boot:run"
timeout /t 12 /nobreak > nul

:: ── Start React Frontend ──────────────────────────────────────────────────
echo Starting React Frontend on port 5173...
start cmd /k "cd frontend\real-estate-frontend && npm run dev"

echo.
echo ==================================================
echo   All services starting in separate windows.
echo   ML Service : http://localhost:5000/health
echo   Backend    : http://localhost:8080/api
echo   Frontend   : http://localhost:5173
echo ==================================================
pause
