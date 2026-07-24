@echo off
REM Runs black, ruff, and mypy in sequence (uses venv's python directly,
REM so it works even if the venv isn't activated in this terminal)
REM Usage:
REM   check          - format + lint + type-check the app/scripts folders

set PYTHON=%~dp0venv\Scripts\python.exe

echo.
echo [1/3] black
"%PYTHON%" -m black app scripts
if errorlevel 1 goto :error
echo.

echo [2/3] ruff
"%PYTHON%" -m ruff check app scripts
if errorlevel 1 goto :error
echo.

echo [3/3] mypy
"%PYTHON%" -m mypy app scripts
if errorlevel 1 goto :error

goto :eof

:error
echo Check failed.
exit /b 1
