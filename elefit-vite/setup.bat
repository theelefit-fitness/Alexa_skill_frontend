@echo off
echo Setting up EleFit Fitness Tracker...

echo Installing frontend dependencies...
npm install

echo Setting up Python virtual environment...
python -m venv backend\venv

echo Installing backend dependencies...
backend\venv\Scripts\pip install -r backend\requirements.txt

echo Setup complete!
echo.
echo To start the application, run:
echo npm start
echo.
echo This will start both the React frontend and Flask backend.
echo.
pause 