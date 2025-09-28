# Development Dockerfile for Astro dev server
FROM node:20-bullseye-slim

WORKDIR /usr/src/app

# Install tooling
RUN apt-get update && apt-get install -y build-essential git && rm -rf /var/lib/apt/lists/*

# Copy package manifests first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=development || npm install

# Copy the rest of the source
COPY . ./

# Expose dev port
EXPOSE 3000

# Default command: run dev server on 0.0.0.0 so external containers/hosts can hit it
CMD ["npm", "run", "dev"]
