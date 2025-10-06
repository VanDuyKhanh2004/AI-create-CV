#!/bin/bash

echo "Starting AI CV Builder Development Environment..."

echo ""
echo "Starting Backend Server..."
gnome-terminal -- bash -c "cd server && npm run dev; exec bash"

echo ""
echo "Waiting 3 seconds for backend to start..."
sleep 3

echo ""
echo "Starting Frontend Server..."
gnome-terminal -- bash -c "cd client && npm start; exec bash"

echo ""
echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
