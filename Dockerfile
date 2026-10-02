# Anime Black server (Node + Express + Gemini search agent + the web app itself).
# Build:  docker build -t anime-black .
# Run:    docker run -p 3000:3000 -e GEMINI_API_KEY=... anime-black
FROM node:22-alpine

WORKDIR /app

# Dependencies first (better layer caching). The server only needs production packages.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Application files (see .dockerignore for what is left out).
COPY . .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# The container platform usually provides PORT; honour it.
CMD ["node", "server.js"]
