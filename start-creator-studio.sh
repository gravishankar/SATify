#!/bin/bash

# Creator Studio Startup Script
echo "🎨 Starting Creator Studio Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🚀 Starting Creator Studio Server on port 3001..."
echo "📖 Access your app at: http://localhost:8010"
echo "🔧 Server API at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node server.js