# Frontend — CLAUDE.md

React + Vite frontend for AcademyPro.

## Key Rules

- Functional components only, named exports, `PascalCase.tsx`
- Custom hooks for all API calls: `use{Action}{Resource}.ts` (e.g. `useGetPlayers.ts`)
- All API calls go through `src/services/api.ts` (Axios instance with JWT + academy header interceptors)
- Server state via `@tanstack/react-query` — use `useQuery` / `useMutation`
- Global client state via Zustand — only for auth and current academy (`src/store/auth.store.ts`)
- All UI text in **Spanish**
- No `any` types — define interfaces in `src/types/index.ts`

## Directory Layout

```
src/
├── pages/          # One folder per route group (auth, dashboard, players…)
├── components/     # Shared UI — common/ for generic, layout/ for shell
├── hooks/          # Custom hooks (useGetPlayers.ts, useCreatePlayer.ts…)
├── services/       # api.ts Axios instance
├── store/          # Zustand stores
└── types/          # Shared TypeScript interfaces
```
