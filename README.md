# Next.js Starter Kit

My personal Next.js starter kit that I clone for new projects. Saves me from reconfiguring the same stack every time.

> [!NOTE]
> This is my personal starter kit for new projects. It's opinionated and evolving based on my needs. Feel free to fork and adapt it for your own use.

## Stack & Features

- Next.js 15 + React 19 (App Router, Server Components)
- TypeScript 5 (strict)
- API/Data: oRPC + TanStack Query
- Database: Drizzle ORM + PostgreSQL
- Auth: Better Auth (email verification, password reset, OAuth)
- UI: Tailwind CSS v4 + shadcn/ui
- Email: Resend + React Email
- Validation: Zod v4
- Env: @t3-oss/env-nextjs (type-safe + runtime validation)
- Quality: ESLint 9, Prettier, Husky, Commitlint
- Infrastructure: Docker + Docker Compose (multi-stage builds)

## What's Included

- Complete auth flows (signin, signup, password reset, email verification)
- Dashboard with sidebar navigation and command palette (⌘K)
- Settings pages (profile, account, appearance, notifications, advanced)
- Sample CRUD pages (products, orders, customers, analytics)
- Email templates (verification, password reset, change email)
- Protected routes with middleware
- Mobile responsive navigation
- Docker development environment with hot reload

## Prerequisites

- Node.js 18+ (20 LTS recommended)
- Docker and Docker Compose
- Google OAuth credentials ([Get them here](https://console.cloud.google.com/))
- Resend API key ([Get it here](https://resend.com/api-keys))

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url> my-new-project
cd my-new-project
npm ci
npm run prepare  # Enable git hooks
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update all required values:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp"

# Auth
BETTER_AUTH_SECRET="your-secret-here"  # Generate: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
EMAIL_VERIFICATION_CALLBACK_URL="http://localhost:3000/email-verified"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="onboarding@yourdomain.com"

# Docker (auto-set by start-dev.sh)
USER_ID=1000
GROUP_ID=1000
```

> [!IMPORTANT]
> All environment variables are validated at runtime. Missing or invalid values will prevent startup.

### 3. Database Setup

```bash
# Start database
npm run dev:db

# Push schema
npm run db:push
```

### 4. Start Development

```bash
# Next.js dev server
npm run dev

# Or everything with Docker + hot reload
npm run dev:docker
```

Visit http://localhost:3000

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── (auth)/               # Auth pages (signin, signup, password reset, etc.)
│   │   │   ├── _components/forms/
│   │   │   └── */page.tsx
│   │   ├── (protected)/
│   │   │   └── dashboard/
│   │   │       ├── _components/  # Dashboard UI components
│   │   │       │   └── sidebar/
│   │   │       ├── settings/     # Settings pages (profile, account, etc.)
│   │   │       └── */page.tsx    # CRUD pages (products, orders, etc.)
│   │   ├── (public)/              # Public pages with navbar
│   │   ├── api/
│   │   │   ├── auth/[...all]/    # Better Auth endpoints
│   │   │   ├── rpc/[[...rest]]/  # oRPC handler
│   │   │   └── health/           # Health check
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── ui/                   # 30+ shadcn/ui components
│   │   └── *.tsx                 # Shared components
│   ├── server/
│   │   ├── api/
│   │   │   ├── orpc.ts           # Base procedures & middleware
│   │   │   └── routers/          # API endpoints
│   │   ├── auth.ts               # Auth configuration
│   │   └── db/
│   │       ├── index.ts          # Database client
│   │       └── schema.ts         # Drizzle schema
│   ├── lib/
│   │   ├── auth/client.ts        # Auth client utilities
│   │   ├── orpc/                 # oRPC setup & providers
│   │   ├── email.ts              # Email sending
│   │   └── utils.ts              # Shared utilities
│   ├── emails/                   # React Email templates
│   ├── schemas/                  # Zod validation schemas
│   ├── hooks/                    # Custom React hooks
│   ├── constants/routes.ts       # Route definitions
│   ├── env.js                    # Environment validation
│   └── middleware.ts             # Auth & route protection
├── docker-compose.yml            # Base services
├── docker-compose.override.yml   # Dev overrides
├── docker-compose.prod.yml       # Production config
├── Dockerfile                    # Multi-stage build
├── drizzle.config.ts            # Database config
├── start-dev.sh                 # Dev startup script
├── .env.example                 # Environment template
└── [config files]               # ESLint, Prettier, TypeScript, etc.
```

## Working with oRPC

**Define API endpoints** in `src/server/api/routers/`:

```typescript
import { z } from "zod";

import { publicProcedure, router } from "../orpc";

export const userRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ context, input }) => {
      return context.db.query.users.findMany({
        limit: input.limit ?? 10,
      });
    }),
});
```

**Use on client** with full type safety:

```typescript
"use client";
import { orpc } from "@/lib/orpc/utils";

export function UserList() {
  const { data } = orpc.user.list.useSuspenseQuery({ limit: 10 });
  return <div>{data.map(...)}</div>;
}
```

## Available Scripts

| Command        | Description                   |
| -------------- | ----------------------------- |
| `dev`          | Start Next.js dev server      |
| `dev:docker`   | Start all services with watch |
| `dev:db`       | Start database only           |
| `build`        | Production build              |
| `start`        | Start production server       |
| `check`        | Run all checks (lint + types) |
| `lint`         | ESLint with cache             |
| `lint:fix`     | Auto-fix issues               |
| `typecheck`    | TypeScript validation         |
| `format:write` | Apply formatting              |
| `format:check` | Check formatting              |
| `db:generate`  | Generate migrations           |
| `db:migrate`   | Apply migrations              |
| `db:push`      | Push schema (dev)             |
| `db:studio`    | Drizzle Studio UI             |

## Docker Development

The project uses Docker Compose with multiple configurations:

- **`docker-compose.yml`** - Base services (web + postgres)
- **`docker-compose.override.yml`** - Dev overrides (auto-merged, hot reload)
- **`docker-compose.prod.yml`** - Production configuration

### Development Modes

```bash
# Database only (recommended for development)
npm run dev:db        # Start postgres in Docker
npm run dev           # Run Next.js on host

# All services in Docker (alternative)
npm run dev:docker    # Everything with hot reload
```

The `start-dev.sh` script handles environment parsing, validates Docker installation, checks for port conflicts, and warns about default passwords.

### Multi-Stage Dockerfile

- **`development`** - Hot reload with volume mounts, runs `npm run dev`
- **`production`** - Minimal image (~150MB), non-root user, production dependencies only

### Common Commands

**Typical development (database in Docker, Next.js on host):**

```bash
npm run dev:db        # Start postgres
npm run db:push       # Push schema
npm run db:studio     # Open Drizzle Studio
npm run dev           # Start Next.js
```

**Full Docker development:**

```bash
npm run dev:docker    # Start everything in containers
```

**Production:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Cleanup:**

```bash
docker-compose down         # Stop services
docker-compose down -v      # Stop and remove volumes (resets database)
```

## Development Workflow

```bash
npm run dev:db             # Start database
npm run dev                # Start Next.js
# Make changes...
git add -A
git commit -m "feat(ui): add navigation drawer"
```

Git hooks automatically run on commit: format → lint → typecheck.

### Commit Format

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
**Scopes:** `auth`, `api`, `ui`, `db`, `config`, `build`, `tests`, `docs`, `deps`, `infra`

## Database Workflows

**Development:** Edit schema → `npm run db:push`
**Production:** Edit schema → `npm run db:generate` → `npm run db:migrate`

## Deployment

Update environment variables for production (especially `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and API keys).

**Docker-based platforms (Railway, Fly.io, self-hosted):**

```bash
# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Using PM2 (without Docker):**

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "app" -- start
pm2 save
pm2 startup
```

Health checks available at `/api/health`.

## Stack Decisions

**oRPC** - Simpler than tRPC, better Server Components support. Still type-safe.

**Drizzle** - SQL-like syntax, lighter than Prisma, better type inference.

**Better Auth** - More straightforward than NextAuth v5. Email verification built-in.

**@t3-oss/env-nextjs** - Validates env vars at build time. Catches issues early.

**Docker** - Consistent environments. One Dockerfile for dev and production.

## What's Next

This template evolves with my projects. Currently working on:

- Completing Better Auth integration (delete account, change email, update password)
- Adding real content to dashboard pages
- Simple CRM module (contacts, companies, notes) to demonstrate oRPC patterns
- Role-based access control
- Researching file upload solutions (S3/R2/Uploadthing)

## Using This Template

Built for my workflow, but you're welcome to use it. Fork it, adapt it, remove what you don't need. Issues and PRs are welcome.

## Resources

- Next.js: https://nextjs.org/docs
- oRPC: https://orpc.unnoq.com/
- Drizzle ORM: https://orm.drizzle.team/
- Better Auth: https://better-auth.com/
- TanStack Query: https://tanstack.com/query
- shadcn/ui: https://ui.shadcn.com/
- T3 Env: https://env.t3.gg/

## License

MIT - Use however you want.

---

Built for quick starts and clean foundations.
