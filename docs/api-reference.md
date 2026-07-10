# API Reference

Base URL (development): `http://localhost:5000`

## Auth (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /register | Public | Register citizen |
| POST | /login | Public | Login, returns accessToken + refresh cookie |
| POST | /logout | Bearer | Clear refresh token |
| POST | /refresh | Cookie | New access token |
| GET | /me | Bearer | Current user |

## Complaints (`/api/complaints`)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | / | Citizen | Create complaint |
| GET | / | Admin | List all (filters: category, status, priority, department) |
| GET | /my | Citizen | Own complaints |
| GET | /:id | Any | Single complaint |
| PATCH | /:id/status | Admin, Worker | Update status |
| PATCH | /:id/assign | Admin | Assign worker |
| PATCH | /:id/verify | Admin | Approve/reject work |
| PATCH | /:id/close | Admin | Close complaint |
| DELETE | /:id | Admin | Delete |

## Workers (`/api/workers`)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | / | Admin | Create worker |
| GET | / | Admin | List workers |
| GET | /:id | Admin, Worker | Get worker |
| GET | /:id/tasks | Admin, Worker | Assigned tasks |
| GET | /department/:dept | Admin | By department |
| GET | /performance | Admin | Performance summary |
| PATCH | /:id | Admin | Update |
| DELETE | /:id | Admin | Delete |

## Files (`/api/files`)

| Method | Path | Description |
|--------|------|-------------|
| POST | /upload?folder=complaints\|before\|after | Upload images (max 5, 5MB each) |
| DELETE | /:publicId | Delete from Cloudinary |

## Notifications (`/api/notifications`)

| Method | Path | Description |
|--------|------|-------------|
| GET | / | User notifications |
| PATCH | /:id/read | Mark read |
| PATCH | /read-all | Mark all read |
| DELETE | /:id | Delete |
| POST | /trigger | Internal — trigger notification + email |

## Analytics (`/api/analytics`)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | /dashboard | Admin | Full dashboard metrics |
| GET | /complaints | Admin | Breakdown by category/status/department |
| GET | /workers | Admin | Worker performance |
| GET | /trends | Admin | Monthly trends (12 months) |

## Health

Every service: `GET /health` → `{ status: "ok", service: "<name>", timestamp }`
