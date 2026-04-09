# Backend — CLAUDE.md

NestJS backend for AcademyPro.

## Key Rules

- Every module lives in `src/modules/{domain}/`
- Each module contains: `entities/`, `dto/`, `{domain}.module.ts`, `{domain}.service.ts`, `{domain}.controller.ts`
- Use `@CurrentUser()` decorator to get the authenticated user from the JWT payload
- Use `@Roles(UserRole.X)` + `RolesGuard` for access control — never inline role checks in controllers
- Academy context comes from the `X-Academy-Id` header — available on `request.userAcademyRole`
- All responses are wrapped by `ResponseInterceptor` → `{ statusCode, message, data }`
- Never return `passwordHash` in any response DTO
- Use `class-validator` decorators on all DTOs
- Migrations for every schema change — run `npm run migration:generate -- src/database/migrations/Name`

## Module Structure Template

```
src/modules/example/
├── entities/
│   └── example.entity.ts
├── dto/
│   ├── create-example.dto.ts
│   └── update-example.dto.ts
├── example.controller.ts
├── example.service.ts
└── example.module.ts
```
