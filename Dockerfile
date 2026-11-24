# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve@14.2.4

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start serve: prerendered pages as files, app routes rewritten to app.html and a real 404 for
# everything else (dist/serve.json, see scripts/prerender.mjs)
CMD ["serve", "dist", "-l", "3000"]

