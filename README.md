# CivicConnect

**Smart Municipal Complaint Management System** — a production-ready MERN monorepo with independently deployable microservices.

## Features

- Citizen complaint submission with photos and geolocation
- Admin dashboard with analytics, worker assignment, and verification
- Worker task management with before/after photo uploads
- Real-time updates via Socket.IO
- Email notifications (Nodemailer)
- Image storage (Cloudinary)
- Role-based access: Citizen, Admin, Worker

## Architecture

```
                    ┌─────────────┐
                    │  Frontend   │  :3000 (Vite)
                    │   (React)   │
                    └──────┬──────┘
                           │ HTTP / Socket.IO
                    ┌──────▼──────┐
                    │ API Gateway │  :5000
                    └──────┬──────┘
         ┌─────────────────┼─────────────────┐
         │                 │                 │
   ┌─────▼─────┐   ┌───────▼───────┐  ┌─────▼─────┐
   │   Auth    │   │  Complaints   │  │  Workers  │
   │   :5001   │   │    :5002      │  │   :5003   │
   └───────────┘   └───────────────┘  └───────────┘
         │                 │                 │
   ┌─────▼─────┐   ┌───────▼───────┐  ┌─────▼─────┐
   │   Files   │   │ Notifications │  │ Analytics │
   │   :5004   │   │    :5005      │  │   :5006   │
   └───────────┘   └───────────────┘  └───────────┘
```

Each service has its own `package.json`, `.env`, MongoDB database, Dockerfile, and Procfile.

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- SMTP credentials (Gmail app password or similar)

## Quick Start

```bash
cd civic-connect

# Install all services
npm run install:all

# Copy env files and fill values
cp api-gateway/.env.example api-gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/complaint-service/.env.example services/complaint-service/.env
cp services/worker-service/.env.example services/worker-service/.env
cp services/file-service/.env.example services/file-service/.env
cp services/notification-service/.env.example services/notification-service/.env
cp services/analytics-service/.env.example services/analytics-service/.env
cp frontend/.env.example frontend/.env

# Start each service (separate terminals)
npm run dev:auth
npm run dev:complaints
npm run dev:workers
npm run dev:files
npm run dev:notifications
npm run dev:analytics
npm run dev:gateway
npm run dev:frontend
```

Or use Docker:

```bash
docker-compose up --build
```

## Environment Variables

| Service | Key Variables |
|---------|---------------|
| api-gateway | `JWT_SECRET`, `*_SERVICE_URL`, `CLIENT_URL` |
| auth-service | `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET` |
| complaint-service | `MONGODB_URI`, `NOTIFICATION_SERVICE_URL`, `SOCKET_URL` |
| worker-service | `MONGODB_URI`, `AUTH_SERVICE_URL`, `COMPLAINT_SERVICE_URL` |
| file-service | `CLOUDINARY_*`, `JWT_SECRET` |
| notification-service | `MONGODB_URI`, `SMTP_*`, `INTERNAL_SERVICE_KEY` |
| analytics-service | `MONGODB_URI`, `JWT_SECRET` |
| frontend | `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_GOOGLE_MAPS_API_KEY` (optional) |

## Deployment

### Render.com (Recommended)

Deploy each folder as a separate Web Service. Set root directory per service (see master prompt table). Update all URLs to `.onrender.com` endpoints after deploy.

### Docker on VPS

```bash
git clone <repo> && cd civic-connect
# fill all .env files
docker-compose up --build -d
```

### Railway.app

New Project → Deploy from GitHub → set Root Directory per service.

## Status Flow

```
NEW → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → COMPLETED_BY_WORKER
  → REWORK_REQUIRED ↔ IN_PROGRESS
  → VERIFIED_BY_ADMIN → CLOSED
```

## Role Access Matrix

| Feature | Citizen | Admin | Worker |
|---------|---------|-------|--------|
| Submit complaint | ✓ | | |
| View own complaints | ✓ | | |
| View all complaints | | ✓ | |
| Assign workers | | ✓ | |
| Verify / Close | | ✓ | |
| Manage workers | | ✓ | |
| Analytics | | ✓ | |
| Assigned tasks | | | ✓ |
| Update task status | | | ✓ |
| Upload progress photos | | | ✓ |

## API Reference

See [docs/api-reference.md](./docs/api-reference.md)

## License

MIT
