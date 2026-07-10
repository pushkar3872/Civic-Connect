# Architecture

CivicConnect uses a **monorepo with microservices** pattern. Each service is a standalone Node.js application that communicates over HTTP and Socket.IO only.

## Services

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| api-gateway | 5000 | — | Proxy, JWT verify, rate limit, Socket.IO |
| auth-service | 5001 | civicconnect-auth | Users, JWT, refresh tokens |
| complaint-service | 5002 | civicconnect-complaints | Complaints CRUD, status flow |
| worker-service | 5003 | civicconnect-workers | Worker profiles, task counts |
| file-service | 5004 | — | Cloudinary uploads |
| notification-service | 5005 | civicconnect-notifications | In-app + email notifications |
| analytics-service | 5006 | civicconnect-complaints (read) | Dashboard metrics |
| frontend | 3000 | — | React SPA |

## Isolation Rules

1. No cross-service `require()` — each service copies shared constants/utils locally
2. Each service has its own `node_modules` and `.env`
3. Inter-service calls use environment variable URLs only
4. `shared/` folder is reference documentation only

## Communication

- **Client → Gateway → Service**: All API traffic proxied through gateway
- **Service → Notification**: HTTP POST `/api/notifications/trigger`
- **Service → Gateway**: HTTP POST `/internal/socket/emit` for real-time events
- **Client ↔ Gateway**: Socket.IO for live complaint updates
