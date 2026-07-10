# Setup Guide

## 1. Clone and install

```bash
git clone <your-repo-url>
cd civic-connect
npm run install:all
```

## 2. MongoDB Atlas

Create a cluster and databases:
- `civicconnect-auth`
- `civicconnect-complaints`
- `civicconnect-workers`
- `civicconnect-notifications`

Use the same cluster connection string with different database names in each service `.env`.

## 3. Cloudinary

1. Sign up at cloudinary.com
2. Copy Cloud Name, API Key, API Secret to `services/file-service/.env`

## 4. JWT secrets

Use the same `JWT_SECRET` across gateway and all services. Set a separate `JWT_REFRESH_SECRET` in auth-service.

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. SMTP (notifications)

For Gmail:
1. Enable 2FA
2. Create App Password
3. Set `SMTP_USER`, `SMTP_PASS` in notification-service `.env`

## 6. Google Maps (optional)

For reverse geocoding in complaint form, set `VITE_GOOGLE_MAPS_API_KEY` in `frontend/.env`.

## 7. Start services

Start in order (or use separate terminals):

```bash
npm run dev:auth          # :5001
npm run dev:complaints    # :5002
npm run dev:workers       # :5003
npm run dev:files         # :5004
npm run dev:notifications # :5005
npm run dev:analytics     # :5006
npm run dev:gateway       # :5000
npm run dev:frontend      # :3000
```

## 8. Create admin user

Register via UI, then update role in MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "ADMIN" } })
```

## Troubleshooting

- **503 from gateway**: Ensure target service is running and URL in gateway `.env` is correct
- **401 errors**: Check `JWT_SECRET` matches across services
- **CORS errors**: Set `CLIENT_URL=http://localhost:3000` in gateway and auth-service
- **Socket not connecting**: Verify `VITE_SOCKET_URL=http://localhost:5000`
