FROM node:20 AS base
RUN corepack enable
WORKDIR /app
ENV SERVER_PORT=12478

# Stage 1: Install dependencies
FROM base AS deps
COPY . .
RUN cd client && pnpm install --frozen-lockfile
RUN cd server && pnpm install --frozen-lockfile

# Stage 2: Build the client and the server
# -- Client
FROM base AS client 
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY . .
RUN cd client && pnpm run build

# -- Server
FROM base AS server 
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY . .
RUN cd server && pnpm run build

# Stage 3: Production server
FROM base AS runner
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/client/package.json ./client/package.json
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/server/package.json ./server/package.json
ENV NODE_ENV=production
COPY --from=client /app/client/public ./client/public
COPY --from=client /app/client/.next ./client/.next

COPY --from=server /app/server/dist ./server/dist
COPY ./prod.sh /app/prod.sh

CMD ["bash", "./prod.sh"]