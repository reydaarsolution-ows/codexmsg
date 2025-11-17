#!/bin/bash

# Exit on error
set -e

# Set environment
NODE_ENV=production

# Install dependencies
echo "Installing dependencies..."
npm ci --production

# Build the application
echo "Building application..."
npm run build

# Create necessary directories
echo "Setting up directories..."
mkdir -p ./logs

# Set permissions
echo "Setting permissions..."
chmod +x ./server.js
chmod +x ./server/index.mjs

# Start the application
echo "Starting application..."
npm run start:prod

echo "Deployment completed successfully!"
