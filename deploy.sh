#!/bin/bash
set -e

echo "🔧 Fixing and deploying..."

# Check location
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Run from project root!"
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Copy to backend
echo "📋 Copying to backend..."
cd ..
rm -rf backend/dist
cp -r frontend/dist backend/dist

# Install ALL backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Verify ngeohash is installed
if [ ! -d "node_modules/ngeohash" ]; then
    echo "⚠️  Installing ngeohash explicitly..."
    npm install ngeohash axios
fi

# List what we're deploying
echo "📂 Contents of backend/dist:"
ls -la dist/

echo "📦 Installed packages:"
ls node_modules/ | grep -E "ngeohash|axios|express|cors|mongodb"

# Deploy
echo "☁️  Deploying to GCP..."
gcloud app deploy

echo "✅ Done!"
gcloud app browse --no-launch-browser