@echo off
echo Checking MongoDB...
net start MongoDB >nul 2>&1
if errorlevel 1 (
    echo MongoDB not running. Starting...
    mongod --dbpath "C:\data\db" >nul 2>&1 &
    timeout /t 3 /nobreak >nul
)

echo Starting backend server...
cd backend
start /B node server.js
cd ..
timeout /t 5 /nobreak >nul

echo Running tests...
python test_25_cases.py

echo Stopping server...
taskkill /F /IM node.exe >nul 2>&1
