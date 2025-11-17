# Production Deployment Script for Windows

# Stop on error
$ErrorActionPreference = "Stop"

# Set environment variables
$env:NODE_ENV = "production"

Write-Host "🚀 Starting MsgXone Production Deployment" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm ci --production

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Cyan
npm run build

# Create necessary directories
Write-Host "📂 Setting up directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path ".\logs" | Out-Null

# Set permissions (Windows specific)
Write-Host "🔒 Setting permissions..." -ForegroundColor Cyan
icacls "." /grant "Everyone:(OI)(CI)F" /T

# Start the application using PM2 (if installed)
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    Write-Host "🚀 Starting application with PM2..." -ForegroundColor Green
    pm2 delete msgxone 2>&1 | Out-Null
    pm2 start npm --name "msgxone" -- start
    pm2 save
    pm2 startup | Out-Null
    Write-Host "✅ Application started with PM2" -ForegroundColor Green
    Write-Host "📋 Run 'pm2 logs msgxone' to view logs" -ForegroundColor Cyan
}
else {
    # Fallback to npm start if PM2 is not installed
    Write-Host "ℹ️ PM2 not found. Starting with npm..." -ForegroundColor Yellow
    Write-Host "🚀 Starting application with npm..." -ForegroundColor Green
    Start-Process "npm" -ArgumentList "start" -NoNewWindow
}

Write-Host "✨ Deployment completed successfully!" -ForegroundColor Green
