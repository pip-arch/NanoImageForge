# Testing Guide for NanoImageForge

This guide will help you test the application locally and understand what works and what needs configuration.

## 🚀 Quick Start (Minimal Setup)

### Prerequisites Check
✅ Node.js v22.14.0 - Installed
✅ npm 10.9.2 - Installed
✅ Dependencies - Installed

### Configuration Status

#### Required for Full Functionality
- [ ] **PostgreSQL Database** - Need connection string
- [ ] **fal.ai API Key** - Need API key for AI processing
- [ ] **Google Cloud Storage** - Optional, for file storage

#### What Works Without Full Setup
- ✅ Frontend UI can be viewed
- ✅ Component library and design system
- ✅ Client-side routing and navigation
- ❌ Image upload (requires storage)
- ❌ AI processing (requires fal.ai API)
- ❌ Database operations (requires PostgreSQL)

## 🧪 Testing Scenarios

### Scenario 1: Frontend UI Testing (No Backend Required)

You can test the frontend UI without backend configuration:

```bash
# Build the frontend only
npm run build

# Or use Vite's preview mode
npx vite preview --open
```

**What to test:**
- UI components and styling
- Responsive design
- Navigation between pages
- Component interactions

### Scenario 2: Full Stack Testing (Backend Required)

For full functionality, you need:

1. **Set up PostgreSQL Database**
   - Option A: Use free tier from [Neon](https://neon.tech)
   - Option B: Use [Supabase](https://supabase.com)
   - Option C: Install PostgreSQL locally

2. **Get fal.ai API Key**
   - Sign up at [fal.ai](https://fal.ai)
   - Get API key from dashboard
   - Add to `.env` file

3. **Update .env file**
   ```env
   DATABASE_URL=your_postgresql_connection_string
   FAL_API_KEY=your_fal_api_key
   SESSION_SECRET=generate_random_32_char_string
   PORT=5000
   NODE_ENV=development
   ```

4. **Initialize Database**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Scenario 3: Docker Testing

Test the application in a containerized environment:

```bash
# Build Docker image
docker build -t nanoimageforge:test .

# Run with environment variables
docker run -p 5000:5000 --env-file .env nanoimageforge:test
```

## 🔍 What to Test

### Frontend Components

1. **Landing Page** (`/`)
   - Hero section display
   - Feature showcase
   - Call-to-action buttons

2. **Home Dashboard** (`/home`)
   - User profile display
   - Quick action cards
   - Navigation links

3. **Editor Page** (`/editor`)
   - Image upload interface
   - Prompt input field
   - Template selector
   - Settings panel
   - Before/after comparison

4. **Gallery Page** (`/gallery`)
   - Image grid display
   - Filtering options
   - Download functionality

### Backend Endpoints

Test with tools like Postman or curl:

1. **Health Check**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Authentication**
   ```bash
   curl http://localhost:5000/api/auth/user
   ```

3. **Templates**
   ```bash
   curl http://localhost:5000/api/templates
   ```

4. **Sessions** (requires auth)
   ```bash
   curl http://localhost:5000/api/sessions
   ```

## 🐛 Known Issues and Limitations

### Current Limitations

1. **Replit-Specific Code**
   - Some code is optimized for Replit environment
   - May need modifications for local development
   - Replit Auth needs alternative for non-Replit deployments

2. **Database Dependencies**
   - Database must be running before starting server
   - Migration system requires manual execution
   - No seed data included

3. **External Service Dependencies**
   - fal.ai API required for image processing
   - Google Cloud Storage for file uploads
   - No local file storage fallback

### Potential Issues

1. **Authentication**
   - Replit Auth only works on Replit
   - Need to implement alternative auth for local dev

2. **File Upload**
   - Requires Google Cloud Storage credentials
   - No local filesystem storage option

3. **CORS**
   - May need CORS configuration for production
   - Currently configured for development

## 🛠️ Development Tips

### Hot Reload Development

The project uses Vite for fast hot-reload:

```bash
npm run dev
```

Changes to frontend code will hot-reload automatically.
Backend changes require server restart.

### Type Checking

Run TypeScript type checking:

```bash
npm run check
```

### Database Migrations

Push schema changes to database:

```bash
npm run db:push
```

### Viewing Database

Use Drizzle Studio to view database:

```bash
npx drizzle-kit studio
```

## 📊 Performance Testing

### Load Testing

Use tools like Apache Bench or k6:

```bash
# Test image upload endpoint
ab -n 100 -c 10 http://localhost:5000/api/sessions

# Test template endpoint
ab -n 1000 -c 50 http://localhost:5000/api/templates
```

### Monitoring

Monitor application performance:
- Response times
- Memory usage
- Database query performance
- API rate limits

## 🔐 Security Testing

### Basic Security Checks

1. **Environment Variables**
   - Ensure .env is not committed
   - Use strong SESSION_SECRET

2. **Input Validation**
   - Test with malformed requests
   - Test file upload limits
   - Test SQL injection prevention

3. **Authentication**
   - Test protected routes
   - Test session expiration
   - Test token validation

## 📱 Browser Compatibility

Test in multiple browsers:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

Test responsive design:
- Mobile (320px - 480px)
- Tablet (768px - 1024px)
- Desktop (1024px+)

## 🎯 Testing Checklist

### Pre-Deployment Testing

- [ ] All TypeScript compiles without errors
- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] API endpoints respond correctly
- [ ] File upload works
- [ ] Image processing completes
- [ ] Authentication flow works
- [ ] Error handling works properly
- [ ] Frontend UI renders correctly
- [ ] Responsive design works on all devices
- [ ] CORS configured for production domain
- [ ] Security headers configured
- [ ] Rate limiting tested
- [ ] Database connection pooling configured

### Post-Deployment Testing

- [ ] Application accessible via URL
- [ ] SSL certificate valid
- [ ] Database connection stable
- [ ] File storage accessible
- [ ] API performance acceptable
- [ ] Error logging working
- [ ] Monitoring setup complete

## 🆘 Troubleshooting

### Common Issues

1. **"Cannot connect to database"**
   - Check DATABASE_URL in .env
   - Ensure database is running
   - Check firewall settings

2. **"Module not found" errors**
   - Run `npm install`
   - Clear node_modules and reinstall
   - Check Node.js version

3. **"Port already in use"**
   - Change PORT in .env
   - Kill process using port 5000

4. **"fal.ai API error"**
   - Verify FAL_API_KEY is valid
   - Check API rate limits
   - Ensure API key has permissions

### Debug Mode

Enable detailed logging:

```bash
# Set environment variable
$env:DEBUG="*"
npm run dev
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [fal.ai Documentation](https://fal.ai/docs)
- [Vite Documentation](https://vitejs.dev)

---

**Ready to test?** Start with Scenario 1 (Frontend UI) and progressively move to full stack testing as you configure services.
