# Build context is the repo root (set in docker-compose).
# This Dockerfile is at api/Dockerfile.

FROM node:20-alpine AS deps
WORKDIR /app
COPY api/package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY api/package.json api/tsconfig.json ./
COPY api/src ./src
RUN npx tsc -p tsconfig.json

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV CONTENT_DIR=/app/content
ENV INDEX_PATH=/app/index.json

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY api/package.json ./
# content/ is bind-mounted at runtime (see docker-compose.yml) so the chatbot
# stays in sync with edits to the markdown files without rebuilding the image.

EXPOSE 8080

# Build the RAG index at container start (talks to LiteLLM), then serve.
# Keeps the API key out of the image.
CMD ["sh", "-c", "node dist/rag/build-index.js && node dist/index.js"]
