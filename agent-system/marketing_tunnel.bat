@echo off
setlocal EnableDelayedExpansion
title He Marketing - ngrok tunnel + QR
cd /d "%~dp0"

REM ================== CAU HINH ==================
set "FRONT_PORT=3002"
set "BACK_PORT=8002"
REM (Tuy chon nhung NEN bat) bao ve bang mat khau — sua user:pass roi bo "REM ":
REM set "NGROK_AUTH=--basic-auth=admin:doitay@2026"
set "NGROK_AUTH="
REM =============================================

echo.
echo === [1/4] Kiem tra / khoi dong dich vu ===

REM --- Backend (FastAPI :%BACK_PORT%) ---
call :is_up %BACK_PORT%
if "!UP!"=="1" (
  echo   Backend :%BACK_PORT% dang chay.
) else (
  echo   Khoi dong backend :%BACK_PORT% ...
  start "MKT-Backend" cmd /k "cd /d "%~dp0" && python run.py"
)

REM --- Frontend (Next :%FRONT_PORT%) ---
call :is_up %FRONT_PORT%
if "!UP!"=="1" (
  echo   Frontend :%FRONT_PORT% dang chay.
) else (
  echo   Khoi dong frontend :%FRONT_PORT% ...
  start "MKT-Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
)

echo.
echo === [2/4] Cho frontend san sang (:%FRONT_PORT%) ===
:wait_front
call :is_up %FRONT_PORT%
if not "!UP!"=="1" (
  timeout /t 2 >nul
  goto wait_front
)
echo   OK - frontend da len.

echo.
echo === [3/4] Mo ngrok tunnel -^> :%FRONT_PORT% ===
echo   (Neu bao loi authtoken: chay 1 lan  ngrok config add-authtoken ^<token^>)
start "ngrok" ngrok http %FRONT_PORT% %NGROK_AUTH%

echo.
echo === [4/4] Lay URL cong khai + tao QR ===
python "%~dp0tunnel_qr.py"

echo.
echo ================================================================
echo  GIU cua so nay + cua so "ngrok" mo de duy tri ket noi.
echo  Dong "ngrok" = ngat truy cap tu xa.
echo ================================================================
pause
goto :eof

REM ---- ham: kiem tra 1 port TCP dang mo tren 127.0.0.1 -> UP=1/0 ----
:is_up
set "UP=0"
for /f %%R in ('powershell -NoProfile -Command "try{$c=New-Object Net.Sockets.TcpClient;$c.Connect('127.0.0.1',%1);$c.Close();'1'}catch{'0'}"') do set "UP=%%R"
goto :eof
