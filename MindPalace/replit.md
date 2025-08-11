# KnowledgeLink - AI-Powered Personal Knowledge Base

## Overview

KnowledgeLink is a full-stack web application that allows users to save web links and automatically process them with AI to create a searchable knowledge base. The application extracts content from submitted URLs, generates intelligent summaries using Google's Gemini AI, and creates vector embeddings for natural language search capabilities. Users can authenticate via Replit Auth, submit links through a clean interface, and search their saved content using semantic similarity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Authentication Flow**: Session-based authentication with automatic redirect handling

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with proper error handling and middleware
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Content Processing**: Custom web scraping service using Cheerio for HTML parsing
- **Background Processing**: Asynchronous content extraction and AI processing pipeline

### Data Storage Architecture
- **Primary Database**: PostgreSQL (Neon) with vector extension support
- **Schema Design**: 
  - Users table for authentication data
  - Links table with vector embeddings for semantic search
  - Sessions table for authentication state
- **Vector Search**: PostgreSQL with pgvector for similarity search on content embeddings
- **Data Relationships**: Foreign key relationships between users and their saved links

### Authentication and Authorization
- **Authentication Provider**: Replit Auth using OpenID Connect
- **Session Strategy**: Server-side sessions stored in PostgreSQL
- **Authorization Pattern**: Middleware-based route protection with user context injection
- **Security**: HTTP-only cookies with secure flags and CSRF protection

## External Dependencies

### AI Services
- **Google Gemini API**: Used for content summarization and text embedding generation
- **Models**: 
  - `gemini-2.0-flash-exp` for text summarization
  - `text-embedding-004` for vector embeddings

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database with vector search capabilities
- **Connection**: WebSocket-based connection using @neondatabase/serverless

### Authentication
- **Replit Auth**: OpenID Connect provider for user authentication
- **OAuth Flow**: Standard authorization code flow with PKCE

### Content Processing
- **Web Scraping**: Direct HTTP requests with User-Agent headers for content extraction
- **HTML Parsing**: Cheerio library for server-side DOM manipulation and content extraction

### Development and Deployment
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Type Checking**: TypeScript with strict mode enabled
- **Development Tools**: TSX for TypeScript execution, various ESLint and development plugins