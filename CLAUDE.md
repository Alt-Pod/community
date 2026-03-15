# Community — Monorepo Conventions

## Architecture

Yarn v1 workspaces monorepo with hexagonal architecture.

```
apps/web          → Next.js app (pages, API routes, middleware, components, requests)
packages/ui       → Design system (pure presentational components only — no async API calls, no business types)
packages/backend  → Backend adapters (database, auth)
packages/ai       → Agent system (model, routing, execution)
packages/shared   → Shared types, constants (zero deps)
packages/i18n     → Translations (next-intl config + JSON message files)
```

## Package Naming

All packages use the `@community/` scope:
- `@community/web`, `@community/ui`, `@community/backend`, `@community/ai`, `@community/shared`, `@community/i18n`

## Import Conventions

- Types and constants shared between packages → import from `@community/shared`
- Database and auth functions → import from `@community/backend`
- Agent/AI functions → import from `@community/ai`
- UI components → import from `@community/ui`
- App-internal imports use `@/*` (maps to `apps/web/src/*`)

## Backend Layers

The `packages/backend` follows a two-layer architecture:

```
packages/backend/src/
  repositories/   → Database access (async). One file per entity.
  services/       → Business domain logic (async). One file per domain.
  handlers/       → Business logic (sync/non-async).
  helpers/        → Async utilities extracted from services (not a service, not a repository).
```

### Repositories
- **Purpose**: All database access goes here — queries, inserts, deletes.
- **Pattern**: Classes instantiated with their collection (table) and the `sql` client.
- **Naming**: `<entity>Repository.ts` → e.g. `userRepository.ts`, `conversationRepository.ts`
- **Methods**: async instance methods like `findOne`, `findById`, `create`, `deleteById`.

### Services
- **Purpose**: Business domain logic with async processing (hashing, orchestration, etc.).
- **Pattern**: Classes that receive repository instances as constructor dependencies.
- **Naming**: `<domain>Service.ts` → e.g. `userService.ts`, `chatService.ts`
- **Methods**: async instance methods that coordinate repositories + business rules.

### Handlers
- **Purpose**: Synchronous business logic (validation, transformation, formatting).
- **Pattern**: Classes with static methods (no instantiation needed).
- **Naming**: `<domain>Handler.ts` → e.g. `validationHandler.ts`

### Helpers
- **Purpose**: Async utility functions that don't belong in a service or repository. Parts of service methods can be extracted here for reuse.
- **Pattern**: Plain exported async functions (no class needed).
- **Naming**: `<domain>Helper.ts` → e.g. `hashHelper.ts`, `emailHelper.ts`

### Wiring
- Repositories are instantiated once with their table + `sql` client, then exported.
- Services are instantiated once with their repository dependencies, then exported.
- API routes import services (or repositories directly for simple reads).

## RESTful API Conventions

API routes live in `apps/web/src/app/api/` and follow REST principles:

- **Resources are nouns**, not verbs — `/api/conversations`, not `/api/getConversations`
- **HTTP methods map to actions**: GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
- **Sub-resources are nested**: `/api/conversations/[id]/messages`, not `/api/messages?conversationId=x`
- **Consistent JSON error format**: `{ "error": "<message>" }` with appropriate HTTP status codes
- **Status codes**: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Server Error)

### Current API Surface

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/conversations` | List user's conversations |
| `POST` | `/api/conversations` | Create a new conversation |
| `GET` | `/api/conversations/[id]` | Get a conversation |
| `DELETE` | `/api/conversations/[id]` | Delete a conversation |
| `GET` | `/api/conversations/[id]/messages` | List messages in a conversation |
| `POST` | `/api/conversations/[id]/messages` | Send a message (streams AI response) |
| `POST` | `/api/auth/register` | Register a new user |

### Rules for New Endpoints

- Always nest sub-resources under their parent (e.g. messages under conversations)
- Keep route handlers thin — delegate to services/repositories
- Never write raw SQL in route files
- Streaming responses (SSE) are allowed for POST endpoints that produce incremental results

## Frontend Data Fetching (TanStack Query)

All API responses must be cached on the frontend using `@tanstack/react-query`. Never use raw `fetch` + `useState`/`useEffect` for data fetching in components.

- **`QueryProvider`** wraps the app in `apps/web/src/app/layout.tsx` (lives in `apps/web/src/query-provider.tsx`)
- **Query keys** follow the pattern `["resource", id?, "sub-resource"?]` — e.g. `["conversations"]`, `["messages", conversationId]`
- **Cache invalidation**: after mutations, call `queryClient.invalidateQueries({ queryKey: [...] })` to refetch stale data
- **Default stale time**: 60s (configured in `QueryProvider`)

### Request Layer (`apps/web/src/requests/`)

All API calls and TanStack hooks live in a dedicated `requests/` folder:

```
apps/web/src/requests/
  api/                    ← Raw async functions that call API endpoints
    conversationsApi.ts
    messagesApi.ts
  useConversations.ts     ← TanStack useQuery/useMutation hooks
  useCreateConversation.ts
  useDeleteConversation.ts
  useMessages.ts
```

- **`requests/api/`**: Pure async fetch wrappers — one file per resource. These are the only place raw `fetch()` calls to the backend should exist in the frontend.
- **`requests/`**: TanStack hooks that use the `api/` functions. One hook per operation. Mutations include cache invalidation logic.
- App components (`apps/web/src/components/`) import hooks from `@/requests/`, never call `fetch()` directly.
- **`packages/ui/`** components never import from `requests/` — they are pure presentational components with no async API calls or business types.

## Internationalization (i18n)

Translations use `next-intl` via the `@community/i18n` package.

```
packages/i18n/
  messages/         ← One JSON file per locale
    en.json
    fr.json
    es.json
    it.json
    de.json
  src/
    config.ts       ← locales list, defaultLocale
    request.ts      ← next-intl getRequestConfig
    index.ts        ← barrel export
```

### Supported Locales
`en` (default), `fr`, `es`, `it`, `de`

### Rules
- **No hardcoded user-facing strings** — all text must use translation keys
- In client components: `const t = useTranslations("namespace")`
- In server components: `const t = await getTranslations("namespace")`
- Translation keys are nested by feature: `auth.login.submit`, `chat.sidebar.title`, etc.
- When adding new UI text, add the key to **all 5 locale files**
- `NextIntlClientProvider` wraps the app in `layout.tsx`
- next-intl plugin is configured in `apps/web/next.config.ts`

## Key Rules

- **shared** has zero runtime dependencies — types and constants only
- **backend** depends on shared only
- **ai** depends on shared + backend
- **ui** depends on shared only (React is a peerDependency)
- **web** depends on all packages
- Tailwind CSS lives in `apps/web` only — UI components use class names, app compiles CSS
- `.env.local` lives at repo root, symlinked into `apps/web/`
- `auth.config.ts` must stay Edge-compatible (no Node.js-only imports)

## Commands

```bash
yarn dev              # Start Next.js dev server
yarn build            # Production build
yarn lint             # ESLint
yarn db:migrate       # Run migrations (local)
yarn db:migrate:prod  # Run migrations (Neon)
```

## Adding a New Package

Use the `/scaffold-package` skill or manually:
1. Create `packages/<name>/` with `package.json`, `tsconfig.json`, `src/index.ts`
2. Name it `@community/<name>` in package.json
3. Add `"@community/<name>": "*"` to consuming packages
4. Add to `transpilePackages` in `apps/web/next.config.ts`
5. Run `yarn install`
