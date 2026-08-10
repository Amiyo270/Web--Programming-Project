# Deployment Guide

## Recommended deployment: Render

### Backend
1. Create a new Web Service in Render.
2. Connect to your GitHub repo.
3. Set the build command: `npm install --legacy-peer-deps && npm run build`
4. Set the start command: `node backend/server.complete.js`
5. Set environment variables:
   - `PORT=5000`
   - `FRONTEND_URL=https://<your-render-frontend-url>`
   - `ADMIN_SECRET=<secure-admin-secret>`
   - `JWT_SECRET=<secure-jwt-secret>`
   - `DB_HOST=<your-db-host>`
   - `DB_USER=<your-db-user>`
   - `DB_PASSWORD=<your-db-password>`
   - `DB_NAME=<your-db-name>`

### Frontend
1. Create a new Static Site in Render.
2. Connect to the same GitHub repo.
3. Set the build command: `npm install --legacy-peer-deps && npm run build`
4. Set the publish directory: `frontend/dist`
5. Set environment variable:
   - `VITE_API_URL=https://<your-backend-url>`

## Quick local run
- Backend: `cd backend && npm install && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev`
