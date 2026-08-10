# Use Node LTS for both frontend and backend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy frontend and backend package manifests
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY backend/package.json backend/package-lock.json ./backend/

# Install frontend dependencies and build
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps
RUN npm run build

# Install backend dependencies
COPY backend ./backend
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

# Prepare final image with backend and built frontend
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Environment variables should be injected at runtime by the deployment platform
WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "server.complete.js"]
