# Multi-stage production container
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Install native dependencies required for Puppeteer / Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npm run build

# Production Runtime
FROM node:20-bullseye-slim AS runner

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends chromium && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/templates ./dist/templates

EXPOSE 8000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
