# 🚀 Quick Start Guide

## The "Missing Login Page" Explained

**Good news:** There is no separate login page needed for local development!  

### How Authentication Works

#### On Replit (Production)
- Uses Replit's OAuth authentication
- Shows a proper login page
- Secure user authentication

#### On Your Local Machine (Development)
- **Auto-login enabled** - you're automatically logged in as "Dev User"
- No login page needed
- Perfect for testing and development

### Starting the Application

#### Option 1: PowerShell Script (Easiest)

```powershell
# In PowerShell, navigate to project folder
cd "C:\Users\lisov\Downloads\NanoImageForge (1)\NanoImageForge"

# Run the startup script
.\start-local.ps1
```

#### Option 2: Manual Start

```bash
# Make sure you're in the project directory
cd "C:\Users\lisov\Downloads\NanoImageForge (1)\NanoImageForge"

# Start the server
npm run dev
```

#### Option 3: Frontend Only (No Backend)

If you just want to see the UI:

```bash
npm run build
npx vite preview --open
```

### What to Expect

When you open http://localhost:5000, you should see:

1. **Home Page** - Welcome screen with quick actions
2. **Auto-Login** - You're logged in as "Dev User" (look in top-right corner)
3. **Full Access** - All features available without logging in

### Why Isn't It Working?

If the server won't start, it's likely because:

1. **Port 5000 is busy**
   - Solution: Change PORT in .env to 3000 or another port
   
2. **Dependencies issue**
   - Solution: Run `npm install` again
   
3. **Node.js version**
   - Solution: Make sure you have Node.js 18 or higher

4. **Environment variable issue**
   - Solution: The script should handle this, but if not, manually set in .env

### Testing Without Backend

You can still test the frontend UI without running the backend:

```bash
# Build the frontend
npm run build

# Preview it
npx vite preview --open
```

This opens at http://localhost:4173

### Current Status

✅ **What Works Without Setup:**
- Frontend UI
- Page navigation
- Component interactions
- Design and layout

⚠️ **Needs Backend Running:**
- Image upload
- AI processing
- Database operations
- Templates from database

⚠️ **Needs API Keys:**
- fal.ai image processing (get from https://fal.ai)
- Google Cloud Storage (optional)

## Manual Start Instructions

If the PowerShell script doesn't work:

### Step 1: Open PowerShell/Terminal

```powershell
# Navigate to project
cd "C:\Users\lisov\Downloads\NanoImageForge (1)\NanoImageForge"
```

### Step 2: Set Environment

```powershell
# PowerShell
$env:NODE_ENV="development"

# Or edit .env file
# NODE_ENV=development
```

### Step 3: Start Server

```powershell
npm run dev
```

### Step 4: Open Browser

Open: http://localhost:5000

## Troubleshooting

### "Port 5000 already in use"

```powershell
# Kill process on port 5000
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}

# Then start again
npm run dev
```

### "Cannot find module"

```powershell
# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

### Server starts but browser shows error

1. Wait 10-15 seconds for server to fully start
2. Try refreshing the page
3. Check console for errors (F12 in browser)
4. Check terminal for server errors

### "cross-env is not recognized"

```powershell
# Install cross-env
npm install --save-dev cross-env

# Try again
npm run dev
```

## What You'll See

### Home Page (`/`)
- Welcome message with your name "Dev User"
- Quick action cards:
  - 🎨 Start Editing
  - 📂 View Gallery  
  - 📋 Templates
- User profile in header (top-right)
- Sign Out button (will just refresh in dev mode)

### Editor Page (`/editor`)
- Left sidebar: Upload and templates
- Center: Image canvas
- Right sidebar: AI prompt input
- No login required - already authenticated!

### Gallery Page (`/gallery`)
- View your processed images
- Download functionality
- Filter and sort options

## Development Notes

### Auto-Login Details

In development mode:
- You're automatically logged in as:
  - **Name:** Dev User
  - **Email:** dev@localhost
  - **ID:** dev-user-123

### Mock Storage

Data is stored in memory:
- ⚠️ Data is lost when server restarts
- Perfect for testing
- To persist data, add DATABASE_URL to .env

### Real Database (Optional)

To use a real database:

1. Get free PostgreSQL from [Neon.tech](https://neon.tech)
2. Add to .env:
   ```env
   DATABASE_URL=postgresql://user:pass@host/dbname
   ```
3. Run: `npm run db:push`
4. Restart server

## Next Steps

1. **Test the UI**
   - Start the server
   - Navigate through pages
   - Try different features

2. **Add API Key** (optional)
   - Get fal.ai API key
   - Add to .env: `FAL_API_KEY=your_key`
   - Restart server
   - Try AI image processing

3. **Deploy Online**
   - Works great on Replit
   - Already on GitHub: https://github.com/pip-arch/NanoImageForge
   - See DEPLOYMENT.md for options

## Quick Commands Reference

```bash
# Start development server
npm run dev

# Build frontend only
npm run build

# Preview built frontend
npx vite preview --open

# Type check
npm run check

# Initialize database (if using real DB)
npm run db:push

# Stop all Node processes
Stop-Process -Name node -Force
```

## Still Having Issues?

1. Check `LOCAL_SETUP.md` for detailed setup
2. Check `TESTING_GUIDE.md` for troubleshooting
3. See error messages in terminal
4. Open browser console (F12) for frontend errors

## Summary

- ✅ No separate login page needed in development
- ✅ Auto-login as "Dev User"
- ✅ Start with: `npm run dev`
- ✅ Open: http://localhost:5000
- ✅ You should see the home page with user logged in

**The "missing login page" isn't missing - you're already logged in! 🎉**
