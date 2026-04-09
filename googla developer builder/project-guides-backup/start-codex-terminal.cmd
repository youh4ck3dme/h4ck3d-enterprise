@echo off
setlocal

set "SCRIPT_DIR=%~dp0"

powershell -NoLogo -NoExit -ExecutionPolicy Bypass -Command "& { . '%SCRIPT_DIR%tools\terminal\codex-terminal.ps1' }"

endlocal
