# Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Install dependencies for build
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --prefer-offline --no-audit || \
    (npm config set registry https://registry.npmjs.org && npm install)

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --production --prefer-offline --no-audit || \
    (npm config set registry https://registry.npmjs.org && npm install --production)

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Start application (TypeORM auto-creates tables with synchronize:true)
CMD ["node", "dist/index.js"]
