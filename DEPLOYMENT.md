# Deployment Guide

This guide covers different deployment options for NanoImageForge.

## 🚀 Quick Deploy Options

### Replit (Recommended for Development)

1. **Import to Replit**
   - Go to [replit.com](https://replit.com)
   - Click "Import from GitHub"
   - Enter your repository URL

2. **Configure Environment**
   - Add environment variables in Replit Secrets
   - The app will automatically detect Replit environment

3. **Database Setup**
   - Use Replit's built-in PostgreSQL database
   - Or connect to external database

### Vercel (Frontend + Serverless)

1. **Deploy Frontend**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Set `NODE_ENV=production`

### Railway (Full Stack)

1. **Connect Repository**
   - Connect your GitHub repository to Railway
   - Railway will auto-detect the Node.js app

2. **Configure Environment**
   - Add environment variables in Railway dashboard
   - Railway provides PostgreSQL addon

### Render (Full Stack)

1. **Create Web Service**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set start command: `npm start`

2. **Add PostgreSQL Database**
   - Create PostgreSQL database in Render
   - Copy connection string to `DATABASE_URL`

## 🐳 Docker Deployment

### Local Docker

```bash
# Build the image
docker build -t nanoimageforge .

# Run with environment file
docker run -p 5000:5000 --env-file .env nanoimageforge
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/nanoimageforge
      - FAL_API_KEY=${FAL_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=nanoimageforge
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

## ☁️ Cloud Deployment

### AWS (EC2 + RDS)

1. **Launch EC2 Instance**
   - Use Ubuntu 22.04 LTS
   - Install Node.js 18+
   - Configure security groups (port 5000)

2. **Setup RDS PostgreSQL**
   - Create PostgreSQL database
   - Configure security groups
   - Note connection details

3. **Deploy Application**
   ```bash
   # On EC2 instance
   git clone your-repo
   cd NanoImageForge
   npm install
   npm run build
   
   # Set environment variables
   export DATABASE_URL="postgresql://..."
   export FAL_API_KEY="..."
   
   # Start with PM2
   npm install -g pm2
   pm2 start npm --name "nanoimageforge" -- start
   ```

### Google Cloud Platform

1. **Cloud Run Deployment**
   ```bash
   # Build and push to Container Registry
   gcloud builds submit --tag gcr.io/PROJECT_ID/nanoimageforge
   
   # Deploy to Cloud Run
   gcloud run deploy nanoimageforge \
     --image gcr.io/PROJECT_ID/nanoimageforge \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Cloud SQL PostgreSQL**
   - Create Cloud SQL PostgreSQL instance
   - Configure connection and credentials

### Microsoft Azure

1. **Container Instances**
   ```bash
   # Build and push to Azure Container Registry
   az acr build --registry myregistry --image nanoimageforge .
   
   # Deploy to Container Instances
   az container create \
     --resource-group myResourceGroup \
     --name nanoimageforge \
     --image myregistry.azurecr.io/nanoimageforge:latest
   ```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# fal.ai API
FAL_API_KEY=your_fal_api_key

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_BUCKET_NAME=your_bucket_name

# Session Security
SESSION_SECRET=your_secure_random_string_32_chars_min

# Server Configuration
PORT=5000
NODE_ENV=production
```

### Optional Variables

```bash
# Replit-specific
REPL_ID=your_repl_id
REPL_SLUG=your_repl_slug

# Logging
LOG_LEVEL=info

# CORS (if needed)
CORS_ORIGIN=https://yourdomain.com
```

## 🗄️ Database Setup

### PostgreSQL Setup

1. **Create Database**
   ```sql
   CREATE DATABASE nanoimageforge;
   CREATE USER nanoimageforge_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE nanoimageforge TO nanoimageforge_user;
   ```

2. **Run Migrations**
   ```bash
   npm run db:push
   ```

### Database Providers

- **Neon**: Serverless PostgreSQL (recommended)
- **Supabase**: PostgreSQL with additional features
- **Railway**: Simple PostgreSQL hosting
- **AWS RDS**: Managed PostgreSQL
- **Google Cloud SQL**: Managed PostgreSQL

## 📁 File Storage Setup

### Google Cloud Storage

1. **Create Bucket**
   ```bash
   gsutil mb gs://your-nanoimageforge-bucket
   ```

2. **Set Permissions**
   ```bash
   gsutil iam ch allUsers:objectViewer gs://your-bucket-name
   ```

3. **Service Account**
   - Create service account with Storage Admin role
   - Download JSON key file
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### Alternative Storage Options

- **AWS S3**: Modify `objectStorage.ts` for S3 compatibility
- **Azure Blob Storage**: Implement Azure storage adapter
- **Cloudinary**: For image-specific features

## 🔒 Security Considerations

### Production Checklist

- [ ] Use strong `SESSION_SECRET` (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable database SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### SSL/HTTPS Setup

For production deployments, ensure HTTPS is enabled:

- **Cloudflare**: Free SSL certificates
- **Let's Encrypt**: Free SSL with certbot
- **Cloud Provider**: Most cloud providers offer SSL

## 📊 Monitoring & Logging

### Application Monitoring

- **Uptime Monitoring**: Use services like Pingdom or UptimeRobot
- **Error Tracking**: Integrate Sentry or similar
- **Performance**: Monitor response times and database queries

### Logging Setup

```bash
# PM2 logs
pm2 logs nanoimageforge

# Docker logs
docker logs container_name

# Cloud platform logs
# Use platform-specific logging tools
```

## 🔄 CI/CD Pipeline

The included GitHub Actions workflow provides:

- **Automated Testing**: Runs on every push/PR
- **Type Checking**: TypeScript validation
- **Linting**: Code quality checks
- **Security Audit**: Dependency vulnerability scanning
- **Docker Build**: Container image creation

### Deployment Automation

Add deployment steps to `.github/workflows/ci.yml`:

```yaml
deploy:
  runs-on: ubuntu-latest
  needs: [test, lint]
  if: github.ref == 'refs/heads/main'
  
  steps:
    - name: Deploy to production
      # Add your deployment commands here
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check `DATABASE_URL` format
   - Verify database is running and accessible
   - Check firewall/security group settings

2. **File Upload Issues**
   - Verify Google Cloud Storage credentials
   - Check bucket permissions
   - Ensure `GOOGLE_CLOUD_PROJECT_ID` is correct

3. **fal.ai API Errors**
   - Verify `FAL_API_KEY` is valid
   - Check API rate limits
   - Monitor API status

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

### Getting Help

- Check the [Issues](https://github.com/yourusername/NanoImageForge/issues) page
- Review logs for error messages
- Verify environment variable configuration
- Test with minimal configuration first

---

**Need help with deployment? Create an issue with your deployment platform and error details.**

