@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js 24 LTS e abra este arquivo novamente.
  echo Consulte LEIA-ME.md para as instrucoes completas.
  pause
  exit /b 1
)
echo.
echo Patas e Cia - Projeto academico
echo Abra http://localhost:3000 no navegador.
echo Deixe esta janela aberta enquanto utiliza o sistema.
echo.
node server/index.mjs
pause
