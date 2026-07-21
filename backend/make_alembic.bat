@echo off
REM Shortcuts for common Alembic commands (uses venv's python directly,
REM so it works even if the venv isn't activated in this terminal)
REM Usage:
REM   make_alembic migration "message"   - alembic revision --autogenerate
REM   make_alembic upgrade               - alembic upgrade head

set PYTHON=%~dp0venv\Scripts\python.exe

if "%~1"=="migration" (
    "%PYTHON%" -m alembic revision --autogenerate -m "%~2"
) else if "%~1"=="upgrade" (
    "%PYTHON%" -m alembic upgrade head
) else (
    echo Usage:
    echo   make_alembic migration "message"
    echo   make_alembic upgrade
)
