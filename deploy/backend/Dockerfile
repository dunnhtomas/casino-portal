# Production Dockerfile for backend microservice
FROM node:20-bullseye-slim

WORKDIR /app

# Install production deps
COPY package.json package-lock.json* ./
RUN npm ci --production || npm install --production

# Copy backend sources
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "server.js"]
