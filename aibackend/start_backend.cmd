@echo off
echo Starting Aero Flappy Bird Deep Learning AI Backend...
echo Server running on http://localhost:8000
echo Health check: http://localhost:8000/health
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
) else (
    python -m uvicorn main:app --reload --port 8000
)
