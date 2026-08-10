# Deployment Guide

## Recommended deployment: Vercel + Railway

### Frontend (Vercel)
1. Create a new project on Vercel.
2. Connect to your GitHub repo.
3. Set the root directory to `frontend`.
4. Set the build command:
   - `npm install --legacy-peer-deps && npm run build`
5. Set the output directory:
   - `frontend/dist`
6. Add this environment variable:
   - `VITE_API_URL=https://<your-railway-backend-url>`

### Backend (Railway)
1. Create a new project on Railway.
2. Deploy from GitHub and select the `backend` folder as the root.
3. Set the build command:
   - `npm install --legacy-peer-deps`
4. Set the start command:
   - `npm start`
5. Add these environment variables:
   - `PORT=5000`
   - `FRONTEND_URL=https://<your-vercel-frontend-url>`
   - `ADMIN_SECRET=<secure-admin-secret>`
   - `JWT_SECRET=<secure-jwt-secret>`

> Note: `backend/server.complete.js` currently uses an in-memory dataset, so database variables are not required unless you switch to `backend/server.js`.

### Final configuration
- In Vercel, `VITE_API_URL` should point to your Railway backend service URL.
- In Railway, `FRONTEND_URL` should point to your Vercel frontend URL.
- Both services should be deployed from the same GitHub repository.

## Alternative deployment: Render
If you prefer a single host provider, you can also use Render for both frontend and backend:

### Backend (Render)
1. Create a new Web Service in Render.
2. Connect to your GitHub repo.
3. Set the build command:
   - `npm install --legacy-peer-deps && npm run build`
4. Set the start command:
   - `node backend/server.complete.js`
5. Set environment variables:
   - `PORT=5000`
   - `FRONTEND_URL=https://<your-render-frontend-url>`
   - `ADMIN_SECRET=<secure-admin-secret>`
   - `JWT_SECRET=<secure-jwt-secret>`

### Frontend (Render)
1. Create a new Static Site in Render.
2. Connect to the same GitHub repo.
3. Set the build command:
   - `npm install --legacy-peer-deps && npm run build`
4. Set the publish directory:
   - `frontend/dist`
5. Set environment variable:
   - `VITE_API_URL=https://<your-backend-url>`

## Quick local run
- Backend: `cd backend && npm install && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev`
