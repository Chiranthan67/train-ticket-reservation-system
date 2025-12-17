@echo off
echo Starting backend server...
start /B cmd /c "cd backend && npm start"
timeout /t 5 /nobreak >nul
echo Running tests...
python simple_test.py
taskkill /F /IM node.exe >nul 2>&1
