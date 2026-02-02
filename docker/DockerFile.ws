FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# Clean build cache and build the websocket backend and its dependencies
RUN find . -name "tsconfig.tsbuildinfo" -delete && pnpm turbo run build --filter=ws-backend

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nodeapp

# Copy everything from builder (simpler approach)
COPY --from=builder --chown=nodeapp:nodejs /app ./

USER nodeapp
WORKDIR /app/apps/ws-backend

EXPOSE 8080
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
