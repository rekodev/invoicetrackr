FROM node:22 AS base
RUN corepack enable
WORKDIR /app
ENV SERVER_PORT=12478

# Stage 1: Install dependencies
FROM base AS deps
COPY . .
RUN pnpm install --frozen-lockfile

# Stage 2: Build the client and the server
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY . .
RUN (cd client && pnpm run build) & (cd server && pnpm run build) && wait

# Stage 3: Production server
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/client/package.json ./client/package.json
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/server/package.json ./server/package.json
ENV NODE_ENV=production
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/server/dist ./server/dist
COPY ./prod.sh /app/prod.sh

CMD ["bash", "./prod.sh"]
