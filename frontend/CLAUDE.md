# AcademyPro — Frontend CLAUDE.md

> This file is loaded automatically by Claude Code when working inside the `frontend/` directory.
> Always read @docs/PRD.md and @docs/design.md before starting any frontend task.

---

## Tech Stack

| Layer          | Technology      |
| -------------- | --------------- |
| Framework      | React + Vite    |
| Styling        | Tailwind CSS    |
| UI Components  | shadcn/ui       |
| State (server) | React Query     |
| State (client) | Zustand         |
| HTTP Client    | Axios           |
| Routing        | React Router v6 |

---

## Project Structure

```
frontend/
├── src/
│   ├── pages/                  # One folder per route/screen
│   ├── components/             # Shared reusable components
│   │   └── ui/                 # shadcn/ui generated components (do not edit manually)
│   ├── hooks/                  # Custom hooks (API calls, business logic)
│   ├── services/               # Axios instance and API call functions
│   │   └── api.ts              # Axios base instance with JWT interceptor
│   ├── store/                  # Zustand stores
│   │   ├── auth.store.ts       # Auth state (user, token, academyId, role)
│   │   └── academy.store.ts    # Current academy context
│   ├── types/                  # TypeScript interfaces and enums
│   └── lib/                    # Utility functions and helpers
│       └── utils.ts            # cn() helper and other utilities
```

---

## Coding Conventions

- Functional components only — no class components
- Custom hooks for all API calls (e.g. `useGetPlayers`, `useCreatePlayer`)
- Component file naming: `PascalCase.tsx`
- Hook file naming: `camelCase.ts`
- No `any` types in TypeScript — always define proper interfaces
- Use `async/await` over `.then()` chains
- App UI text (labels, messages, errors) always in **Spanish**
- All code, variable names, and comments in **English**

---

## API & Auth

- Axios instance lives in `src/services/api.ts`
- JWT token is stored in Zustand auth store and injected via Axios request interceptor
- All API calls go through custom hooks using React Query
- On 401 response, redirect to login and clear auth store
- Academy context is embedded in the JWT — do not manage academyId separately in headers

---

## API Contract Rule — Non-Negotiable

Before implementing any API call, hook, or service function, Claude MUST first read the corresponding backend controller and service files to verify the exact endpoint, HTTP method, request body shape, query params, and response structure.

The source of truth for all API contracts is the backend source code:

- Controllers: backend/src/modules/{module}/{module}.controller.ts
- DTOs: backend/src/modules/{module}/dto/
- Response DTOs: backend/src/modules/{module}/dto/{entity}-response.dto.ts

Rules:

- Never assume an endpoint exists — always verify it in the backend controller first.
- Never invent request body fields — always match the exact DTO defined in the backend.
- Never assume a response shape — always check the response DTO.
- If a required endpoint does not exist in the backend, stop and notify the developer instead of inventing it.
- Never hardcode base URLs or endpoint paths — always define them as constants in src/services/ and derive them from what is actually implemented in the backend.

---

## Design System: The Kinetic Edge

> Full rules in @docs/design.md — this section summarizes the Tailwind implementation.

### Color Tokens

In Tailwind v4 there is no `tailwind.config.ts`. Define all design tokens in the main CSS file (e.g. `src/index.css`) using the `@theme` directive:

```css
@import "tailwindcss";

@theme {
  --color-background: #0e0e0e;
  --color-surface-lowest: #000000;
  --color-surface-low: #131313;
  --color-surface: #0e0e0e;
  --color-surface-high: #201f1f;
  --color-surface-highest: #262626;
  --color-primary: #bcf521;
  --color-secondary: #00f4fe;
  --color-on-primary: #425900;
  --color-on-surface: #ffffff;
  --color-on-surface-variant: #adaaaa;
  --color-outline-variant: #494847;
  --color-primary-container: #afe700;
  --color-secondary-container: #00696e;
  --color-error-container: #b92902;

  --font-display: "Lexend", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

### Typography Tokens

Fonts are defined inside the `@theme` block above (see `--font-display` and `--font-body`). Import both fonts from Google Fonts in the `index.html` or via `@import` in the CSS file:

```css
@import url("https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&family=Inter:wght@300;400;500&display=swap");
```

| Token       | Class usage                                              | Size      |
| ----------- | -------------------------------------------------------- | --------- |
| display-lg  | `font-display text-[3.5rem] font-bold`                   | 3.5rem    |
| headline-md | `font-display text-[1.75rem] font-semibold`              | 1.75rem   |
| body-md     | `font-body text-[0.875rem]`                              | 0.875rem  |
| label-sm    | `font-body text-[0.6875rem] uppercase tracking-[0.05em]` | 0.6875rem |

### Core Design Rules (enforce on every component)

**Backgrounds & Surfaces**

- Page canvas: `bg-surface-low` (`#131313`)
- Standard cards: `bg-surface-high` (`#201f1f`)
- Hover / elevated overlays: `bg-surface-highest` (`#262626`)
- In-set / deep areas: `bg-surface-lowest` (`#000000`)

**No-Line Rule**

- Never use `border` or `divide` utilities with white or grey colors
- Separate sections using tonal background shifts only
- Exception: Ghost Border on inputs — use `border border-outline-variant/15`

**Glass & Gradient Rule**

- Primary CTAs must use gradient: `bg-gradient-to-br from-primary to-secondary`
- CTA text color: `text-on-primary`
- Floating navbars/headers: `bg-surface-high/70 backdrop-blur-[20px]`

**Cards**

- Always `rounded-3xl` (xl corner radius)
- No internal divider lines — use `gap-8` (2rem) spacing instead
- Top Glow signature: add a 2px gradient top border using a pseudo-element or inline style:
  `background: linear-gradient(135deg, #bcf521, #00f4fe)` on a `h-0.5 w-full` element at the top of the card

**Buttons**

- Primary: `bg-gradient-to-br from-primary to-secondary text-on-primary font-semibold rounded-xl`
- Secondary: `bg-surface-highest text-primary font-medium rounded-xl`
- Tertiary: `bg-transparent text-on-surface-variant hover:text-primary rounded-xl`

**Inputs**

- Background: `bg-surface-low`
- Default border: `border border-outline-variant/15`
- Focus: `focus:border-primary focus:ring-0`
- Text: `font-body text-[0.875rem] text-on-surface`

**Tables**

- Never use standard HTML tables with borders
- Use alternating `bg-surface-high` / `bg-surface-highest` rows
- No vertical or horizontal divider lines

**Body text**

- Never use pure white (`#ffffff`) for long-form text
- Use `text-on-surface-variant` (`#adaaaa`) for descriptions and secondary text
- Use `text-on-surface` (`#ffffff`) only for headlines and key metrics

**Shadows**

- Floating elements (modals, dropdowns): `shadow-[0px_24px_48px_rgba(0,0,0,0.5)]`
- Never use harsh colored shadows

### shadcn/ui Overrides

When installing or using shadcn/ui components, always override their default styles to match The Kinetic Edge design system. Key overrides:

- Replace default white backgrounds with `surface-high` or `surface-highest`
- Replace default border colors with `outline-variant/15` (ghost border)
- Replace default primary color with the Lime-to-Cyan gradient
- Replace default radius with `rounded-3xl` for containers, `rounded-xl` for buttons and inputs
- Replace default font with `font-body` (Inter)

---

## Routing & Role-Based Access

Roles available: `saas_owner`, `academy_director`, `coach`, `parent`

- Use a `ProtectedRoute` wrapper component that reads the role from the Zustand auth store
- Redirect unauthorized roles to an appropriate fallback page
- Never hardcode role checks inside page components — always use the `ProtectedRoute` wrapper or a `useRole` hook

---

## React Query Conventions

- Query keys must be arrays and descriptive: `['players', academyId]`, `['player', playerId]`
- Always handle `isLoading`, `isError`, and empty states in every component that fetches data
- Use `useMutation` for all POST, PATCH, DELETE operations
- Invalidate related queries after successful mutations

---

## Zustand Store Conventions

- One store per domain: `auth.store.ts`, `academy.store.ts`
- Stores must be typed — no `any`
- Persist auth store to `localStorage` using the `persist` middleware

---

## Date Handling

- All dates from the API arrive in UTC ISO 8601 format
- Always display dates converted to local timezone using:
  ```ts
  new Date(dateString).toLocaleString("es-EC", { timeZone: "America/Bogota" });
  ```
- For date-only fields (e.g. `sessionDate`, `birthDate`), display as:
  ```ts
  new Date(dateString).toLocaleDateString("es-EC");
  ```
- Never send raw `Date` objects to the API — always send ISO strings

---

## Error Handling

- All API errors are caught in the Axios interceptor and surfaced via React Query's `isError` state
- Display user-facing errors using shadcn/ui `Toast` component
- Error messages from the backend are already in Spanish — display them as-is using `error.response.data.message`
- Never expose raw technical error messages to the user
