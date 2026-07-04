# ---- Stage 1: Build the React frontend ----
FROM node:20-alpine AS client-build

WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---- Stage 2: Build and run the server ----
FROM node:20-alpine AS server

WORKDIR /app

# Copy server package files and install dependencies
COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev

# Copy server source
COPY server/ ./

# Copy Prisma schema and generate client
COPY server/prisma ./prisma
RUN npx prisma generate

# Copy built frontend into the static directory
RUN mkdir -p public
COPY --from=client-build /app/client/dist ./public

# Expose the application port
EXPOSE 3001

# Start the server (runs migrations on container start, then starts the app)
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]