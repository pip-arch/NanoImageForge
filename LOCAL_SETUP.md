# Local Development Setup Guide

This guide helps you run NanoImageForge on your local machine (Windows, Mac, Linux).

## ⚡ Quick Start (Frontend Only - 2 minutes)

Test the UI without any backend setup:

```bash
# Build and preview the frontend
npm run build
npx vite preview --open
```

This opens the frontend at http://localhost:4173 - you can see the UI but features won't work without backend.

## 🚀 Full Local Setup (With Backend)

### Step 1: Install Dependencies ✅ (Already Done)

```bash
npm install
```

### Step 2: Set Up Database (Required)

The app needs PostgreSQL. **Easiest option - use a free cloud database:**

#### Option A: Neon (Recommended - 2 minutes)

1. Go to https://neon.tech
2. Sign up (free)
3. Click "Create Project"
4. Copy the connection string
5. It looks like: `postgresql://user:pass@host.neon.tech/dbname`

#### Option B: Supabase (Alternative)

1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string (use "Connection pooling" mode)

#### Option C: Local PostgreSQL

```bash
# Install PostgreSQL locally
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb nanoimageforge
```

### Step 3: Configure Environment Variables

Edit the `.env` file in the project root:

```env
# REQUIRED: Database connection
DATABASE_URL=postgresql://user:pass@host:5432/nanoimageforge

# OPTIONAL: For AI processing (get from https://fal.ai)
FAL_API_KEY=your_key_here

# OPTIONAL: For file storage (or leave empty for local testing)
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_BUCKET_NAME=

# Required for sessions
SESSION_SECRET=any_random_string_at_least_32_characters_long

# Server config
PORT=5000
NODE_ENV=development
```

### Step 4: Initialize Database

```bash
npm run db:push
```

This creates all necessary tables in your database.

### Step 5: Start the Server

```bash
npm run dev
```

You should see:
```
🔧 Loading development authentication...
⚠️  DEVELOPMENT MODE: Using mock authentication
serving on port 5000
```

### Step 6: Open Your Browser

Navigate to: http://localhost:5000

🎉 **You're now running NanoImageForge locally!**

## 🔐 About Local Authentication

In local development mode:
- **No login required** - you're automatically logged in as "Dev User"
- This is for testing only - **NOT secure for production**
- Real authentication (Replit Auth) only works on Replit

To see your "logged in" user:
- Open http://localhost:5000
- You'll be auto-logged in
- Look for "Dev User" in the header

## 🎨 What Works Locally

### ✅ Works Without Configuration
- Frontend UI and navigation
- Component library
- Templates display
- Edit history UI
- Settings panel

### ✅ Works With Database Only
- User sessions
- Edit session creation
- Template management
- Edit history tracking

### ⚠️ Needs fal.ai API Key
- AI image processing
- Image transformations
- Apply prompts to images

### ⚠️ Needs Google Cloud Storage (or use local storage)
- Image upload
- File storage
- Image serving

## 🐛 Troubleshooting

### "Cannot connect to database"

**Problem:** Database URL is wrong or database isn't running

**Solution:**
1. Check your `DATABASE_URL` in `.env`
2. Make sure the database exists
3. Test connection: `psql postgresql://your_connection_string`
4. For Neon/Supabase, verify the connection string is correct

### "Port 5000 already in use"

**Problem:** Another app is using port 5000

**Solution:**
```bash
# Change port in .env
PORT=3000

# Or kill the process using port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### "Module not found" errors

**Problem:** Dependencies not installed or corrupted

**Solution:**
```bash
# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Server starts but page shows errors

**Problem:** Database not initialized

**Solution:**
```bash
# Push database schema
npm run db:push

# If that fails, check your DATABASE_URL
```

### "fal.ai API error" when processing images

**Problem:** Missing or invalid API key

**Solution:**
1. Get API key from https://fal.ai/dashboard/keys
2. Add to `.env`: `FAL_API_KEY=your_key_here`
3. Restart server

## 📝 Development Tips

### Hot Reload
- Frontend changes reload automatically (Vite)
- Backend changes require server restart (`Ctrl+C` then `npm run dev`)

### View Database
```bash
# Open Drizzle Studio to view your data
npx drizzle-kit studio
```

### Type Checking
```bash
# Check for TypeScript errors
npm run check
```

### Debugging
Add `console.log()` statements in:
- `server/routes.ts` - API endpoints
- `client/src/` - Frontend components

## 🔄 Making Changes

### Frontend Changes
1. Edit files in `client/src/`
2. Changes auto-reload in browser
3. Check browser console for errors

### Backend Changes
1. Edit files in `server/`
2. Restart server to see changes
3. Check terminal for errors

### Database Changes
1. Edit `shared/schema.ts`
2. Run `npm run db:push`
3. Restart server

## 🎯 What to Test

### Basic Flow
1. Open http://localhost:5000
2. You should see the home page
3. Click "Open Editor"
4. Try uploading an image (needs storage configured)
5. Enter a prompt
6. Click "Apply AI Edit" (needs fal.ai API key)

### Without API Keys
Even without fal.ai API key, you can test:
- UI navigation
- Component interactions
- Template selection
- Edit history UI
- Settings panel
- Responsive design

## 🌐 Accessing from Other Devices

To test on phone/tablet on same network:

1. Find your local IP:
```bash
# Windows
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)

# Mac/Linux
ifconfig
# Look for "inet" address
```

2. Edit `.env`:
```env
PORT=5000
```

3. Start server:
```bash
npm run dev
```

4. On your phone, open:
```
http://YOUR_IP:5000
# Example: http://192.168.1.100:5000
```

## 🚢 Ready for Production?

Once you've tested locally, deploy to production:

1. **Replit** - Best for this project (native support)
2. **Railway** - Easy deployment with database
3. **Render** - Free tier available
4. **Vercel** - Great for frontend (needs serverless API)

See `DEPLOYMENT.md` for detailed deployment guides.

## 🆘 Still Having Issues?

1. Check `TESTING_GUIDE.md` for more troubleshooting
2. Review error messages carefully
3. Check all environment variables are set
4. Try with just database first, then add API keys
5. Create an issue on GitHub if stuck

---

**Happy coding! 🎨** Now you can develop and test NanoImageForge on your local machine!
