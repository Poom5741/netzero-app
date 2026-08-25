# Unified Development Setup

This project now runs as a unified development environment with the backend (Cloudflare Workers) and frontend (Next.js) working together.

## Quick Start

Start both backend and frontend with one command:

```bash
npm run dev:all
```

This will:
- Start the Cloudflare Workers backend on `http://localhost:8787`
- Start the Next.js frontend on `http://localhost:3000`
- Automatically proxy all `/api/*` requests from frontend to backend

## Access the Application

Open your browser and navigate to:

- **Frontend (LIFF Chat App)**: http://localhost:3000/chat
- **Admin Dashboard**: http://localhost:3000/admin
- **Sponsor Dashboard**: http://localhost:3000/sponsor
- **Backend API**: http://localhost:8787

## Architecture

```
Browser (http://localhost:3000)
    ↓
Next.js Frontend
    ↓ (proxies /api/* to)
Cloudflare Workers Backend (http://localhost:8787)
    ↓
D1 Database + R2 Storage
```

## API Endpoints

The frontend automatically proxies these API calls to the backend:

- `POST /api/chat` - Chat with AI assistant
- `GET /api/admin/review` - Get photo review queue
- `POST /api/admin/review/:photoId` - Review a photo
- `GET /api/photo/:photoId` - Get photo from R2

## Demo Mode

The frontend runs in demo mode by default (no LIFF ID configured), so you can test all features without LINE login:

- User ID: `demo-user`
- Display Name: `Demo User`

## Database Setup

Initialize the local database:

```bash
npm run db:init
```

## Testing with Browser Agent

You can now test the entire application flow in the browser:

1. Start the dev environment: `npm run dev:all`
2. Open http://localhost:3000/chat
3. Send messages to the AI assistant
4. Navigate to /admin to review photos
5. Navigate to /sponsor to view sponsor dashboard

All features are accessible and functional through the browser interface.
