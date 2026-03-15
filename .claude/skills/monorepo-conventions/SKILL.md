---
name: monorepo-conventions
description: Hexagonal architecture and monorepo coding conventions for the Community project
user-invocable: false
---

# Monorepo Conventions

## Hexagonal Architecture

This monorepo follows hexagonal architecture principles:

- **Domain (shared)**: Pure types, interfaces, constants. Zero runtime dependencies.
- **Adapters (backend, ai)**: Concrete implementations that talk to external systems (PostgreSQL, AI SDKs, bcrypt).
- **Driving adapters (web)**: API routes that call into backend/ai packages. Kept thin — orchestration only.
- **UI (ui)**: Design system — pure presentational components only. No async API calls, no business types. Uses Tailwind class names (compiled by the app).
- **i18n (i18n)**: Translation files (JSON per locale) and next-intl config. No runtime deps besides next-intl.

## Dependency Direction

```
shared ← backend ← ai
shared ← ui
i18n (standalone)
shared, backend, ai, ui, i18n ← web
```

Never create circular dependencies. Shared must never import from other packages.

## Where to Put New Code

| What | Where |
|------|-------|
| TypeScript interfaces, types, constants | `packages/shared/src/types/` |
| Database queries (all DB access) | `packages/backend/src/repositories/` |
| Business domain logic (async) | `packages/backend/src/services/` |
| Business logic (sync) | `packages/backend/src/handlers/` |
| Auth logic | `packages/backend/src/auth/` |
| AI model config, agent logic, prompts | `packages/ai/src/` |
| Raw API fetch functions | `apps/web/src/requests/api/` |
| TanStack query/mutation hooks | `apps/web/src/requests/` |
| App components (with business logic) | `apps/web/src/components/` |
| Design system components (presentational only) | `packages/ui/src/` |
| Translation JSON files | `packages/i18n/messages/` |
| i18n config (locales, request setup) | `packages/i18n/src/` |
| API routes, pages, middleware | `apps/web/src/` |
| Validation schemas (Zod) | `packages/shared/src/` if shared, otherwise co-locate |

## Backend Layers

The backend package uses a two-layer architecture: **repositories** and **services**.

### Repositories (`packages/backend/src/repositories/`)
- All database access lives here — never write raw SQL in API routes or services.
- Each file is named `<entity>Repository.ts` (e.g. `userRepository.ts`).
- Class instantiated with the `sql` client and its collection/table name.
- Methods are async instance methods: `findById`, `findOne`, `create`, `deleteById`, etc.

### Services (`packages/backend/src/services/`)
- Business domain logic with async processing (hashing, orchestration, side effects).
- Each file is named `<domain>Service.ts` (e.g. `userService.ts`).
- Class receives repository instances as constructor dependencies (DI).
- Methods are async instance methods.

### Handlers (`packages/backend/src/handlers/`)
- Synchronous business logic (validation, transformation, formatting).
- Each file is named `<domain>Handler.ts`.
- Class with **static methods** — no instantiation needed.

### Helpers (`packages/backend/src/helpers/`)
- Async utility functions that don't fit as a service or repository.
- Parts of service methods can be extracted here for reuse.
- Each file is named `<domain>Helper.ts` (e.g. `hashHelper.ts`).
- Plain exported async functions — no class needed.

### Wiring pattern
```ts
// Repositories instantiated with sql + table
const userRepository = new UserRepository(sql, "users");
// Services instantiated with repository deps
const userService = new UserService(userRepository);
// Exported for use in API routes
export { userRepository, userService };
```

API routes should import services (or repositories directly for simple reads). Never write raw SQL in route files.

## RESTful API Design

API routes in `apps/web/src/app/api/` follow REST conventions:

- **Resources are nouns**: `/api/conversations`, not `/api/getConversations`
- **HTTP methods = actions**: GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
- **Sub-resources are nested**: `/api/conversations/[id]/messages`
- **JSON error format**: `{ "error": "<message>" }` with proper HTTP status codes
- **Status codes**: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

When adding a new endpoint:
1. Identify the resource noun (e.g. `users`, `conversations`, `messages`)
2. Nest under parent if it's a sub-resource (e.g. messages belong to conversations)
3. Use the appropriate HTTP method for the action
4. Keep route handlers thin — delegate to services/repositories
5. Never write raw SQL in route files

## Frontend Data Fetching

All API data fetching uses `@tanstack/react-query`. Never use raw `fetch` + `useState`/`useEffect`.

- `QueryProvider` wraps the app (lives in `apps/web/src/query-provider.tsx`)
- `useQuery` for GET requests — caching, deduplication, background refetch
- `useMutation` for POST/PUT/DELETE — invalidate related queries on success
- Query keys: `["resource", id?, "sub-resource"?]` (e.g. `["conversations"]`, `["messages", id]`)

### Request layer (`apps/web/src/requests/`)
- **`requests/api/`** — pure async fetch wrappers, one file per resource (e.g. `conversationsApi.ts`). Only place raw `fetch()` exists in the frontend.
- **`requests/`** — TanStack hooks (`useConversations.ts`, `useDeleteConversation.ts`, etc.) that use the `api/` functions. One hook per operation.
- App components import hooks from `@/requests/`, never call `fetch()` directly.
- `packages/ui/` components never import from `requests/`.

## Frontend Component Rules

- **One component per file** — each `.tsx` file in `apps/web/src/components/` and `packages/ui/src/` must export exactly one React component. No file should define or export multiple components.
- File name should match the component: `ChatPanel` → `chat-panel.tsx`
- Small internal helper components (not exported) are acceptable only if they are tightly coupled to the main component and not reusable. When in doubt, extract to a separate file.

## Import Rules

- Always import types from `@community/shared`, not from sibling packages
- Always use barrel exports (`index.ts`) — don't import internal package paths
- Use `@/*` only within `apps/web` for app-internal imports

## Package Boundaries

- Each package has a single `src/index.ts` barrel export
- All public API goes through the barrel — no deep imports from consumers
- Keep packages focused: if a module doesn't fit, create a new package
