# ---- Builder Stage ----
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Install Python + build tools + ML libraries
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-dev build-essential && \
    pip3 install --no-cache-dir --break-system-packages scikit-learn pandas numpy joblib

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript to /app/dist
RUN npm run build

# ---- Production Stage ----
FROM node:20

# Set working directory
WORKDIR /app

# Copy compiled output and package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --production --legacy-peer-deps

# Set environment
ENV NODE_ENV=production

# Expose app port
EXPOSE 3000

# Start the compiled app
CMD ["node", "dist/app.js"]