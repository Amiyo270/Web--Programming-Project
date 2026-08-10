# Use Node LTS for both frontend and backend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy full repo and install dependencies for frontend and backend
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm install --legacy-peer-deps

# Build frontend
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm run build

# Prepare final image with backend and built frontend
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Environment variables should be injected at runtime by the deployment platform
WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "server.complete.js"]
