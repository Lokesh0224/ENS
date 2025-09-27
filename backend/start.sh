#!/bin/bash

echo "�� Starting Cross-Chain Identity Hub Backend..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file. You can modify it as needed."
    echo ""
fi

# Create storage directory
mkdir -p storage

echo "🔧 Configuration:"
echo "- Port: ${PORT:-3000}"
echo "- IPFS: ${USE_REAL_IPFS:-false}"
echo "- Storage: ${LOCAL_STORAGE_PATH:-./storage}"
echo ""

echo "🌐 Starting server..."
echo "📋 Health check: http://localhost:${PORT:-3000}/health"
echo "🔗 Challenge endpoint: http://localhost:${PORT:-3000}/challenge"
echo "✅ Verify endpoint: http://localhost:${PORT:-3000}/verify"
echo ""

npm start
