#!/bin/bash

# Exit on error
set -e

# Set environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🔨 Building application..."
npm run build

# Set permissions
echo "🔒 Setting permissions..."
chmod +x server.js
chmod +x server/index.mjs

echo "✨ Build completed successfully!"
echo "🚀 Start the application with: npm run start"
