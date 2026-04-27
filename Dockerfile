# --- Stage 1: Build Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY src/frontend/package*.json ./src/frontend/
COPY src/backend/package*.json ./src/backend/
RUN npm install
COPY src/frontend ./src/frontend
RUN npm run build -w src/frontend

# --- Stage 2: Build Backend ---
FROM node:20-slim AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY src/frontend/package*.json ./src/frontend/
COPY src/backend/package*.json ./src/backend/
RUN npm install
COPY src/backend ./src/backend
RUN npm run build -w src/backend

# --- Stage 3: Production Image ---
FROM node:20-slim
WORKDIR /app

# Install production dependencies for backend
COPY package*.json ./
COPY src/backend/package*.json ./src/backend/
RUN npm install --omit=dev -w src/backend

# Copy built backend files
COPY --from=backend-builder /app/src/backend/dist ./src/backend/dist
# Copy built frontend files into backend's reach (consistent with our index.ts path)
COPY --from=frontend-builder /app/src/frontend/dist ./src/frontend/dist

# Expose the port Fastify is listening on
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "src/backend/dist/index.js"]
