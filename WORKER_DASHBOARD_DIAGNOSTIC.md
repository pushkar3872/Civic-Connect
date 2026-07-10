# Worker Dashboard Diagnostic Guide

## How to Debug Why Workers Aren't Showing

### Step 1: Check If You're Logged in as ADMIN
Open browser DevTools (F12) and run:
```javascript
// Check what role you're logged in as
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

// Decode JWT manually (install jwt-decode or use jwt.io)
// The token should contain: { role: 'ADMIN', ... }
```

Expected: Token should have `"role":"ADMIN"` in the payload

---

### Step 2: Check Network Request
1. Open DevTools → Network tab
2. Go to http://localhost:3000/admin/workers
3. Look for the GET request to `/api/workers`

Check the response:
- **Status 401**: Your token is invalid/expired → Login again
- **Status 403**: Your role is not ADMIN → Check role in token
- **Status 200 with empty `[]`**: No workers in database
- **Status 200 with data**: Workers should be displayed

---

### Step 3: Verify Workers Exist in Database
Run this MongoDB query:
```javascript
// In MongoDB client
db.workers.find().pretty()

// Should return something like:
// {
//   "_id": ObjectId("..."),
//   "userId": ObjectId("..."),
//   "name": "John Doe",
//   "email": "john@example.com",
//   "department": "Water",
//   "availability": true,
//   ...
// }
```

---

### Step 4: Test API Directly
Run in terminal or Postman:
```bash
# Get your access token from browser DevTools: localStorage.getItem('accessToken')

curl -X GET http://localhost:5010/api/workers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Should return array of workers:
# {
#   "success": true,
#   "statusCode": 200,
#   "data": [
#     { _id: "...", name: "...", email: "...", ... },
#     ...
#   ]
# }
```

---

### Step 5: Check Frontend Console for Errors
Open DevTools → Console tab and look for:
- API errors
- Socket.IO connection errors
- React Query errors

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Workers exist in DB but not showing | Clear browser cache, reload page, check token expiry |
| Getting 403 Forbidden | Check your user role - must be ADMIN |
| Getting 401 Unauthorized | Login again, token might be expired |
| Empty workers list but data in DB | Check if API returns data in Step 4 |
| Workers show but can't delete | Check browser console for errors in delete request |

---

## Key Files for Reference
- Frontend Component: `frontend/src/pages/admin/ManageWorkers.jsx`
- Worker Hook: `frontend/src/hooks/useWorkers.js`
- Worker API Service: `frontend/src/services/index.js`
- Backend Route: `services/worker-service/src/routes/workerRoutes.js`
- Backend Controller: `services/worker-service/src/controllers/workerController.js`
- API Gateway Proxy: `api-gateway/src/app.js` and `api-gateway/src/config/services.js`

---

## JWT Token Structure
Your JWT should contain:
```json
{
  "id": "user_id",
  "email": "admin@example.com",
  "role": "ADMIN",
  "name": "Admin Name",
  "iat": 1234567890,
  "exp": 1234567890
}
```

If role is anything other than "ADMIN", the worker endpoint will return 403 Forbidden.
