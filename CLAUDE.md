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

## Frontend Component Rules

- **One component per file** — each `.tsx` file in `apps/web/src/components/` and `packages/ui/src/` must export exactly one React component. No file should define or export multiple components.
- File name should match the component: `ChatPanel` → `chat-panel.tsx`
- Small internal helper components (not exported) are acceptable only if they are tightly coupled to the main component and not reusable. When in doubt, extract to a separate file.

## AI Tool Conventions

Tools live in `packages/ai/src/tools/<category>/` and follow the `CommunityToolDefinition` pattern.

### Tool Types

| Type | `execute` | `meta.universal` | Example |
|------|-----------|-------------------|---------|
| **Server-side** | Yes — runs on server | `false` | `agents.create_agent` |
| **Client-side (prompt)** | No — UI collects input, `addToolOutput()` returns result | `true` | `prompt.select` |
| **Context-aware** | Via `toolFactory(ctx)` | `false` | Tools needing `userId`/`agentId` |

### Approval Rules

**Any tool that writes, updates, or deletes data must require user approval.** Set both:
- `meta.requiresConfirmation: true` — frontend renders a warning-style confirmation card
- `tool.needsApproval: true` — AI SDK pauses execution until the user approves or rejects

Read-only tools (search, list, retrieve) execute automatically without approval.

### Universal vs Assignable Tools

- **Universal** (`meta.universal: true`): Automatically available to ALL agents. Not shown in the agent tool assignment UI. Injected by `buildToolsForAgent()` in the registry. The prompt tools (`prompt.select`, `prompt.multi_select`, `prompt.text_input`, `prompt.confirm`, `prompt.form`) are universal.
- **Assignable** (`meta.universal: false` or omitted): Appear in `/api/tools` and can be assigned per-agent via the tool management UI.

### Checklist: Adding a New Tool

1. **Define the tool** in `packages/ai/src/tools/<category>/<tool-name>.ts`
   - Create a `CommunityToolDefinition` with `meta` + `tool` (or `toolFactory`)
   - Use `zodSchema()` for `inputSchema` (and `outputSchema` for client-side tools)
   - Server-side tools: provide `execute` function
   - Client-side tools: omit `execute`, provide `outputSchema`

2. **Register the tool** — export and call `registerTool(def)` in the category's `index.ts`

3. **Import the category** in `packages/ai/src/tools/index.ts` (if new category)

4. **Wire the tool ID into the route** (if not universal)
   - Add the tool ID to `allToolIds` in `apps/web/src/app/api/conversations/[id]/messages/route.ts` for the default assistant
   - For agent-specific tools, ensure they can be assigned via the tool management UI
   - Universal tools (`meta.universal: true`) are injected automatically — skip this step

5. **Update the system prompt** in `packages/ai/src/context.ts`
   - Add instructions explaining what the tool does and when to use it
   - Add to the shared instructions block if universal, or to specific prompts if category-specific
   - **Without this, the AI will not know it can use the tool** — it won't call tools it doesn't know about

6. **Frontend rendering** (if the tool needs custom UI beyond the default cards)
   - Create component(s) in `apps/web/src/components/`
   - Add rendering branch in `chat-panel.tsx` tool parts section

7. **Persistence** (for client-side tools)
   - Ensure `buildPartsFromSteps` in `packages/backend/src/helpers/partsHelper.ts` handles the tool's parts correctly
   - If the tool uses `addToolOutput`, the continuation POST must update stored parts (see `chatService.updatePromptToolOutputs`)

8. **i18n** — Add translation keys to **all 5 locale files** under `tools.<category>.<toolName>`

9. **Filter from assignment UI** (if universal) — Verify `GET /api/tools` excludes tools with `meta.universal: true`

10. **Build** — Run `yarn build` to verify no type errors

## Key Rules

- **shared** has zero runtime dependencies — types and constants only
- **backend** depends on shared only
- **ai** depends on shared + backend
- **ui** depends on shared only (React is a peerDependency)
- **web** depends on all packages
- Tailwind CSS lives in `apps/web` only — UI components use class names, app compiles CSS
- `.env.local` lives at repo root, symlinked into `apps/web/`
- `auth.config.ts` must stay Edge-compatible (no Node.js-only imports)

## Migrations

Migration files live in `migrations/` and are numbered sequentially (`001_init.sql`, `002_...`, etc.).

**Every migration must be idempotent.** The migrate script re-runs all migrations from the start on every invocation — there is no migration-tracking table. If a statement is not idempotent, it will fail on the second run.

- `CREATE TABLE` → use `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX` → use `CREATE INDEX IF NOT EXISTS`
- `ADD COLUMN` → use `ADD COLUMN IF NOT EXISTS`
- `DROP COLUMN` → use `DROP COLUMN IF EXISTS`
- `DROP CONSTRAINT` → use `DROP CONSTRAINT IF EXISTS`
- `DROP INDEX` → use `DROP INDEX IF NOT EXISTS`

Never use bare `ALTER TABLE ... ADD COLUMN` without `IF NOT EXISTS`.

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
