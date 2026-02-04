# Draw App

A pnpm + Turborepo monorepo with Next.js frontends and Node/TypeScript backends.

## Getting Started

Install dependencies:

```bash
pnpm install
```

## What's inside?

### Apps

- `web`: [Next.js](https://nextjs.org/) app (ESM) on port 3002
- `draw-frontend`: [Next.js](https://nextjs.org/) app with separate config
- `http-backend`: Express + JWT + Mongo (CommonJS via `tsc -b`)
- `ws-backend`: WebSocket server + JWT + Mongo (CommonJS via `tsc -b`)

### Packages

- `@repo/ui`: shared React component library
- `@repo/common`: shared Zod schemas
- `@repo/backend-common`: shared backend constants (e.g., `JWT_SECRET`)
- `@repo/db`: Mongoose models + `connectDB()`
- `@repo/eslint-config`: shared flat ESLint configs
- `@repo/typescript-config`: shared `tsconfig` presets

All packages/apps are 100% [TypeScript](https://www.typescriptlang.org/) with strict mode enabled.

## Commands

Run all commands from the repo root.

### Develop

```bash
# All workspaces
pnpm dev

# Single workspace (Turbo filter)
pnpm dev -- --filter=web
pnpm dev -- --filter=http-backend

# Single workspace (pnpm filter)
pnpm --filter draw-frontend dev
pnpm --filter @repo/ui dev
```

### Build

```bash
# All workspaces
pnpm build

# Single workspace
pnpm build -- --filter=@repo/db
pnpm build -- --filter=web
```

### Lint

```bash
# All workspaces
pnpm lint

# Single workspace
pnpm lint -- --filter=web
pnpm lint -- --filter=@repo/ui
```

### Type Check

```bash
# All workspaces
pnpm check-types

# Single workspace
pnpm check-types -- --filter=web
```

### Format

```bash
pnpm format
```

## Architecture

- **Package manager**: pnpm@10 (requires Node >=18)
- **Orchestration**: Turborepo (tasks: `build`, `dev`, `lint`, `check-types`)
- **Formatting**: Prettier (targets `**/*.{ts,tsx,md}`)
- **Linting**: ESLint v9 flat config

## Useful Links

- [Turborepo Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Turborepo Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Turborepo Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Turborepo Configuration](https://turborepo.dev/docs/reference/configuration)
