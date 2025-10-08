@echo off
echo ========================================
echo    FireGuardian - Sistema de Extintores
echo ========================================
echo.

echo Iniciando backend...
cd backend
start "Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo Iniciando frontend...
cd ..\frontend
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo  Aplicacion iniciada exitosamente!
echo ========================================
echo.
echo Backend:  http://localhost:3001/api
echo Frontend: http://localhost:5173
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
