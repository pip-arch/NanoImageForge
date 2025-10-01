# NanoImageForge Local Startup Script
# This script helps start the application on Windows

Write-Host "🎨 NanoImageForge - Local Development Startup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "✅ Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
Write-Host "✅ Checking configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   .env file found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "   ✅ Created .env file" -ForegroundColor Green
}

# Check if node_modules exists
Write-Host "✅ Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting NanoImageForge..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Notes:" -ForegroundColor Yellow
Write-Host "   - Running in DEVELOPMENT mode" -ForegroundColor White
Write-Host "   - Using MOCK authentication (auto-login as Dev User)" -ForegroundColor White
Write-Host "   - Using MOCK storage (data won't persist after restart)" -ForegroundColor White
Write-Host "   - To use real database, set DATABASE_URL in .env" -ForegroundColor White
Write-Host "   - To use AI features, set FAL_API_KEY in .env" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Once started, open: http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Set environment and start
$env:NODE_ENV = "development"
npm run dev

