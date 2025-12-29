@echo off
echo Starting Find My Doctor...

:: Start Service (Backend)
start "Find My Doctor - Service" cmd /k "cd service && npm run dev"

:: Start UI (Frontend)
start "Find My Doctor - UI" cmd /k "cd ui && npm run dev"

echo Servers starting in new windows...
