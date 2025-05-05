#!/bin/bash

echo "Setting up EleFit Fitness Tracker..."

echo "Installing frontend dependencies..."
npm install

echo "Setting up Python virtual environment..."
python3 -m venv backend/venv

echo "Installing backend dependencies..."
backend/venv/bin/pip install -r backend/requirements.txt

echo "Setup complete!"
echo
echo "To start the application, run:"
echo "npm start"
echo
echo "This will start both the React frontend and Flask backend."
echo
read -p "Press Enter to continue..." 