# NanoStudio - AI Image Editor

## Overview

NanoStudio is a full-stack AI-powered image editing application that allows users to upload images and apply AI transformations using natural language prompts. The application features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database for session management and image storage via Google Cloud Storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **shadcn/ui** component library built on Radix UI primitives
- **TailwindCSS** for styling with a custom design system
- **Wouter** for client-side routing
- **TanStack Query** for server state management and API caching
- **Uppy** for advanced file upload handling with progress tracking

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with structured endpoints for sessions, templates, and file operations
- **In-memory storage** implementation with interface for future database integration
- **Error handling middleware** with structured error responses
- **Request logging middleware** for API monitoring

### Data Storage Solutions
- **Drizzle ORM** configured for PostgreSQL with schema definitions
- **Database schema** includes:
  - Edit sessions with status tracking
  - Edit history for version management
  - Templates for predefined editing prompts
- **Google Cloud Storage** integration for image file storage with ACL support
- **Object storage service** with public/private file serving capabilities

### Authentication and Authorization
- **Object-level ACL system** with custom metadata for fine-grained access control
- **Access group types** for flexible permission management
- **Public object search paths** for serving public assets

### External Service Integrations
- **fal.ai API client** for AI image processing using Nano Banana model
- **Google Cloud Storage** for scalable file storage
- **Replit-specific integrations** including development plugins and sidecar authentication

### Key Design Patterns
- **Separation of concerns** with clear client/server/shared boundaries
- **Type-safe API contracts** using shared schema definitions
- **Progressive enhancement** with loading states and error boundaries
- **Modular component architecture** with reusable UI components
- **Real-time processing feedback** with status tracking and progress indicators

## External Dependencies

### Core Services
- **Google Cloud Storage** - Primary file storage and CDN
- **fal.ai** - AI image processing service with Nano Banana model
- **Neon Database** - Serverless PostgreSQL hosting
- **Replit Sidecar** - Authentication and development environment integration

### Development Tools
- **Drizzle Kit** - Database schema management and migrations
- **ESBuild** - Production bundling for server code
- **TypeScript** - Type safety across the entire stack
- **Replit Dev Tools** - Error overlay, cartographer, and dev banner plugins

### UI/UX Libraries
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon system
- **React Hook Form** - Form state management
- **React Dropzone** - File drag-and-drop functionality
- **Uppy Dashboard** - Advanced file upload interface with AWS S3 support