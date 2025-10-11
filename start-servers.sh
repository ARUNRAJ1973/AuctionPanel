#!/bin/bash

echo "🚀 Starting Auction App Servers..."

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "json-server" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
sleep 2

# Start json-server first
echo "📊 Starting database server..."
npm run db &
DB_PID=$!
sleep 3

# Test if database is responding
echo "🔍 Testing database connection..."
if curl -s http://localhost:3001/teams >/dev/null; then
    echo "✅ Database server is running on http://localhost:3001"
else
    echo "❌ Database server failed to start"
    kill $DB_PID 2>/dev/null || true
    exit 1
fi

# Start React app
echo "⚛️  Starting React development server..."
npm start &
REACT_PID=$!

echo "🎉 Both servers are starting..."
echo "📊 Database API: http://localhost:3001"
echo "⚛️  React App: http://localhost:3000"
echo ""
echo "To stop servers, run: kill $DB_PID $REACT_PID"

# Wait for user to stop
wait