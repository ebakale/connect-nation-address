#!/bin/bash

# Pseudolocalization test script
echo "Starting pseudolocalization test..."

# Start development server in background
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Open browser with pseudo locale
echo "Opening browser with pseudolocalization..."
open "http://localhost:5173?lng=pseudo"

# Wait for user input
echo "Press any key to stop pseudolocalization test..."
read -n 1 -s

# Kill development server
kill $DEV_PID

echo "Pseudolocalization test completed."