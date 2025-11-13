FROM node:22 AS base
RUN corepack enable
WORKDIR /app

ARG BACKEND_URL
ARG SERVER_PORT
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY
ARG NEXT_PUBLIC_BASE_URL

ENV BACKEND_URL=${BACKEND_URL}
ENV SERVER_PORT=${SERVER_PORT}
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=${NEXT_PUBLIC_STRIPE_PUBLIC_KEY}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# Stage 1: Install dependencies
FROM base AS deps
COPY . .
RUN pnpm install --frozen-lockfile

# Stage 2: Build the types, client and server
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/types/node_modules ./shared/types/node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY . .
RUN (cd shared/types && pnpm run build) && (cd client && pnpm run build) & (cd server && pnpm run build) && wait

# Stage 3: Production server
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/types/node_modules ./shared/types/node_modules
COPY --from=deps /app/shared/types/package.json ./shared/types/package.json
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/client/package.json ./client/package.json
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/server/package.json ./server/package.json
ENV NODE_ENV=production
COPY --from=builder /app/shared/types/dist ./shared/types/dist
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/server/dist ./server/dist
COPY ./prod.sh /app/prod.sh

CMD ["bash", "./prod.sh"]
