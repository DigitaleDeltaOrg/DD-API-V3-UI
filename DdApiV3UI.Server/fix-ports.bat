@echo off
echo ===============================
echo Cleaning Angular/Node ports...
echo ===============================

echo.
echo Killing all Node processes...
taskkill /IM node.exe /F >nul 2>&1

echo.
echo Checking port 4200...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4200') do taskkill /PID %%a /F >nul 2>&1

echo Checking port 4201...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4201') do taskkill /PID %%a /F >nul 2>&1

echo.
echo Done! Ports should now be free.
echo You can restart your project.
echo.
pause
