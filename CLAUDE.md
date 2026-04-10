# AcademyPro — CLAUDE.md

> This file is loaded automatically by Claude Code at the start of every session.
> For full product context, always read @docs/PRD.md before starting any task.

---

## Project Overview

B2B SaaS platform for soccer academies in Latin America.
Solo developer project. MVP target: 2 months.
**App UI language: Spanish. All code: English.**

---

## Tech Stack

| Layer    | Technology          |
| -------- | ------------------- |
| Frontend | React + Vite        |
| Backend  | NestJS              |
| Database | PostgreSQL via Neon |
| Auth     | JWT + NestJS Guards |
| ORM      | Prisma              |
| Storage  | Cloudinary          |
| Hosting  | Railway or Render   |

---

## Project Structure

```
academy-pro/
├── CLAUDE.md
├── docs/
│   └── PRD.md               # Full product requirements — read this first
├── backend/                 # NestJS app
│   ├── prisma/
│   │   ├── schema.prisma    # Single source of truth for the database schema
│   │   └── migrations/      # Auto-generated migration files — never edit manually
│   ├── src/
│   │   ├── modules/         # One module per domain entity
│   │   │   ├── auth/
│   │   │   ├── academies/
│   │   │   ├── users/
│   │   │   ├── teams/
│   │   │   ├── players/
│   │   │   ├── attendance/
│   │   │   ├── evaluations/
│   │   │   └── notifications/
│   │   ├── common/          # Guards, decorators, interceptors, pipes
│   │   ├── config/          # App config and env validation
│   │   └── prisma/          # PrismaModule and PrismaService (global)
│   └── CLAUDE.md            # Backend-specific rules
└── frontend/                # React + Vite app
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── hooks/
    │   ├── services/        # API calls
    │   ├── store/           # State management
    │   └── types/
    └── CLAUDE.md            # Frontend-specific rules
```

---

## Dev Commands

```bash
# Backend
cd backend
npm run start:dev                          # Start NestJS in watch mode
npx prisma migrate dev --name <name>       # Create and apply a new migration
npx prisma migrate deploy                  # Apply migrations in production
npx prisma db pull                         # Introspect existing DB into schema
npx prisma generate                        # Regenerate Prisma Client after schema changes
npx prisma studio                          # Open Prisma Studio (DB GUI)
npm run test                               # Unit tests
npm run test:e2e                           # E2E tests

# Frontend
cd frontend
npm run dev             # Start Vite dev server
npm run build           # Production build
npm run lint            # ESLint
```

---

## Coding Conventions

### General

- All code, variable names, function names, comments, and database fields in **English**
- App UI text (labels, messages, errors shown to users) in **Spanish**
- Use `async/await` over `.then()` chains
- No `any` types in TypeScript — always define proper interfaces/types
- Use UUIDs for all primary keys (`@id @default(uuid())` in Prisma schema)

### NestJS (Backend)

- One module per domain entity — never mix business logic across modules
- Use DTOs with `class-validator` for all request bodies
- Use custom decorators to extract current user: `@CurrentUser()`
- Use `@Roles()` decorator + `RolesGuard` for role-based access control
- All responses go through a standard response interceptor `{ data, message, statusCode }`
- Never expose `passwordHash` in any response — use response DTOs
- All DB access via `PrismaService` injected into the module's service
- Never instantiate `PrismaClient` directly — always use the global `PrismaService`
- Never use `prisma.$executeRaw` unless absolutely necessary — use Prisma query API

### Prisma

- `schema.prisma` is the **single source of truth** for the database — never alter DB directly
- Run `npx prisma generate` after every schema change before coding
- Migration names must be descriptive: `add_player_photo_url`, `create_invitations_table`
- Never edit migration files manually after they are applied
- Use `@@map("table_name")` and `@map("column_name")` to keep DB names in snake_case while model names stay PascalCase/camelCase in TypeScript
- Always run `npx prisma migrate dev` in development — never `db push` (loses migration history)

### React + Vite (Frontend)

- Functional components only — no class components
- Custom hooks for all API calls (e.g. `useGetPlayers`, `useCreatePlayer`)
- Axios instance in `src/services/api.ts` with JWT interceptor
- Use React Query for server state management
- Use Zustand for global client state (auth, current academy)
- Component file naming: `PascalCase.tsx`
- Hook file naming: `camelCase.ts`

---

## Roles & Access Control

Four roles in the system. See @docs/PRD.md Section 4 for full permissions table.

```
saas_owner        → global platform access
academy_director  → full control of their academy
coach             → limited to their assigned teams
parent            → read-only, their child's data only
```

Role is resolved per-academy via `UserAcademyRole` table.
**Never hardcode role checks in controllers** — always use `RolesGuard` + `@Roles()`.

---

## Database Rules

- All tables use `uuid` as primary key — never auto-increment integers
- Every model has `createdAt DateTime @default(now())` — most also have `updatedAt DateTime @updatedAt`
- Soft deletes preferred over hard deletes — use `isActive Boolean @default(true)`
- See @docs/PRD.md Section 6 for the full schema

---

## Auth Flow

1. User logs in with email + password → receives JWT
2. JWT payload includes: `{ sub: userId, email }`
3. On each request, `JwtGuard` validates token and attaches user to request
4. `RolesGuard` checks `UserAcademyRole` for the current academy context
5. Academy context is passed via header: `X-Academy-Id`

---

## Critical Business Rules

- A user can have **different roles in different academies** — never assume one role per user globally
- A coach can be assigned to **multiple teams** within the same academy
- A player can have **multiple parents** linked to their profile
- Evaluation scores are **dynamic** — based on `EvaluationMetric` configured per academy, not hardcoded columns
- Invitations expire — always check `status` and `expiresAt` before accepting
- Parents only see data for **their linked child** — enforce at service layer, not just frontend

---

## Current Development Status

- [x] Project scaffolding (NestJS + React + Vite)
- [ ] Prisma setup (schema, Neon connection, PrismaService, initial migration)
- [ ] Auth module (register, login, JWT, roles)
- [ ] Academies module
- [ ] Invitations flow
- [ ] Teams module
- [ ] Players module
- [ ] Attendance module
- [ ] Evaluations module
- [ ] Notifications module
- [ ] Parent portal
- [ ] Settings screen

> Update this checklist as features are completed.
