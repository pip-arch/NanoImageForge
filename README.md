# NanoImageForge 🎨

An AI-powered image editing application that transforms images using natural language prompts. Built with React, Express.js, and powered by fal.ai's advanced AI models.

![NanoImageForge Demo](./attached_assets/generated_images/Red_circle_test_image_6391ffed.png)

## ✨ Features

- **🤖 AI-Powered Editing**: Transform images using natural language descriptions
- **📋 Professional Templates**: Pre-built templates for headshots, products, social media
- **🔄 Real-time Processing**: Live status updates and progress tracking  
- **📚 Edit History**: Version control for all your image modifications
- **⚖️ Before/After Comparison**: Side-by-side view of original vs edited images
- **☁️ Cloud Storage**: Secure image storage with Google Cloud Storage
- **🎯 Multiple AI Models**: Support for Nano Banana, Flux, Leffa pose transfer, and more

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Cloud Storage bucket
- fal.ai API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/NanoImageForge.git
   cd NanoImageForge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/nanoimageforge
   
   # fal.ai API
   FAL_API_KEY=your_fal_api_key_here
   
   # Google Cloud Storage
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_BUCKET_NAME=your_bucket_name
   
   # Session Secret
   SESSION_SECRET=your_secure_random_string
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 🏗️ Architecture

### Frontend (`/client`)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** component library (Radix UI primitives)
- **TailwindCSS** for styling
- **TanStack Query** for server state management
- **Wouter** for client-side routing

### Backend (`/server`)
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** for data persistence
- **Google Cloud Storage** for file storage
- **Replit Auth** for authentication

### Shared (`/shared`)
- **Zod schemas** for type-safe API contracts
- **Database schema** definitions

## 📁 Project Structure

```
NanoImageForge/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and API clients
├── server/                # Express.js backend
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   ├── objectStorage.ts   # File storage operations
│   └── db.ts              # Database connection
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database and API schemas
└── attached_assets/       # Static assets and uploads
```

## 🎯 Usage

### Basic Image Editing

1. **Upload an Image**: Drag and drop or click to upload
2. **Describe Your Edit**: Use natural language (e.g., "Remove background and add studio lighting")
3. **Apply AI Edit**: Click the process button and wait for results
4. **Compare Results**: Toggle between original and edited versions
5. **Download**: Save your edited image

### Professional Templates

Choose from pre-built templates:
- **Professional Headshot**: Studio lighting, clean background
- **Product Showcase**: E-commerce ready, white background
- **Social Media**: Instagram-ready, square format
- **Artistic Style**: Creative transformations

### Advanced Features

- **Batch Processing**: Edit multiple images at once
- **Edit History**: Revert to previous versions
- **Custom Settings**: Adjust quality, format, and processing speed
- **Multiple AI Models**: Switch between different AI processing engines

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `FAL_API_KEY` | fal.ai API key for AI processing | ✅ |
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud project ID | ✅ |
| `GOOGLE_CLOUD_BUCKET_NAME` | Storage bucket name | ✅ |
| `SESSION_SECRET` | Secret for session encryption | ✅ |
| `PORT` | Server port (default: 5000) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |

### AI Models

The application supports multiple AI models:

- **Nano Banana**: General purpose image editing
- **Flux Image-to-Image**: High-quality transformations
- **Leffa Pose Transfer**: Body pose modifications
- **Flux Kontext Pro**: Advanced scene modifications

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
# Build the image
docker build -t nanoimageforge .

# Run the container
docker run -p 5000:5000 --env-file .env nanoimageforge
```

### Environment Setup

1. Set up PostgreSQL database
2. Configure Google Cloud Storage bucket
3. Obtain fal.ai API key
4. Set all required environment variables
5. Run database migrations: `npm run db:push`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## 🔒 Security

- All uploaded images are stored securely in Google Cloud Storage
- User authentication via Replit Auth
- Object-level access control for file permissions
- Signed URLs for secure file access
- Session-based authentication with secure tokens

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [fal.ai](https://fal.ai) for AI image processing capabilities
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Replit](https://replit.com) for development platform and authentication
- [Radix UI](https://radix-ui.com) for accessible component primitives

---

**Built with ❤️ using modern web technologies**

