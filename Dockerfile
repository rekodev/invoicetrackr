FROM node:22 AS base
RUN corepack enable
WORKDIR /app

ARG SERVER_PORT
ARG NEXT_PUBLIC_BASE_URL

ENV SERVER_PORT=${SERVER_PORT}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV AUTH_URL=${NEXT_PUBLIC_BASE_URL}

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
COPY shared/types/package.json ./shared/types/package.json
COPY shared/emails/package.json ./shared/emails/package.json
RUN pnpm install --frozen-lockfile

# Stage 2: Build the types, emails, client and server
FROM base AS builder
COPY --from=deps /app ./
COPY . .
RUN cd shared/types && pnpm run build && cd ../.. && \
    cd shared/emails && pnpm run build && cd ../.. && \
    cd client && pnpm run build && cd .. && \
    cd server && pnpm run build

# Stage 3: Prune the server workspace package for production
FROM builder AS server-deploy
RUN pnpm --filter @invoicetrackr/server --prod deploy --legacy /prod/server

# Stage 4: Production server
FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/client/.next/standalone ./
COPY --from=builder /app/client/.next/static ./client/.next/static
COPY --from=builder /app/client/public ./client/public
COPY --from=server-deploy /prod/server ./server
COPY ./app.json /app/app.json
COPY ./prod.sh /app/prod.sh

CMD ["bash", "./prod.sh"]
