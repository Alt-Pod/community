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
| `GET` | `/api/files` | List user's files (optional `?category=` filter) |
| `POST` | `/api/files` | Upload a file (multipart FormData) |
| `GET` | `/api/files/[id]` | Get file metadata + signed URL |
| `PUT` | `/api/files/[id]` | Update file metadata |
| `DELETE` | `/api/files/[id]` | Delete a file |
| `GET` | `/api/meetings` | List user's meetings (filtered scheduled activities) |
| `POST` | `/api/meetings` | Schedule a new meeting |
| `GET` | `/api/meetings/[id]` | Get meeting details + transcript |
| `GET` | `/api/notifications` | List user's notifications (optional `?unread=true`, `?limit=`, `?offset=`) |
| `PATCH` | `/api/notifications/[id]` | Mark a notification as read |
| `DELETE` | `/api/notifications/[id]` | Delete a notification |
| `POST` | `/api/notifications/read-all` | Mark all notifications as read |
| `GET` | `/api/notifications/unread-count` | Get unread notification count (for badge) |
| `POST` | `/api/push-subscriptions` | Save a Web Push subscription |
| `DELETE` | `/api/push-subscriptions` | Remove a Web Push subscription |
| `GET` | `/api/push-subscriptions/vapid-public-key` | Get the public VAPID key |
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
    filesApi.ts
  useConversations.ts     ← TanStack useQuery/useMutation hooks
  useCreateConversation.ts
  useDeleteConversation.ts
  useMessages.ts
  useFiles.ts
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
| **Client-side (action)** | No — UI collects input + performs action, `addToolOutput()` returns result | `false` | `files.upload_file` |
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

## Meeting Activity

Meetings are the first activity type. A meeting is an automated multi-agent conversation orchestrated by a Meeting Master agent.

### Architecture

- **Scheduling**: Meetings are `scheduled_activities` with `activity_type = 'meeting'`. Config stored in `payload` JSONB as `MeetingPayload`.
- **Execution**: The `activityCron` (every minute) finds due activities and dispatches by type. For meetings it emits `meeting/ready`, triggering the `meetingStart` → `meetingRound` → `meetingClosing` → `meetingSummary` chain. Uses `generateText` (not streaming) for each turn.
- **Conversation**: Stored as a `conversation` with `type = 'meeting'`. The user owns it but doesn't participate — only agents talk.
- **Hardcoded agents**: Meeting Master and Summary Agent are system prompt constants in `packages/ai/src/tasks/meetingAgents.ts`, not database agent rows.

### Meeting Flow

1. `activityCron` detects due meeting and emits `meeting/ready`
2. Creates a meeting conversation (`type: 'meeting'`)
3. Meeting Master opens with agenda intro
4. Round-robin: each participant agent speaks per round
5. Duration enforced by wall-clock check before each turn
6. Meeting Master closes the meeting
7. Summary Agent generates a summary
8. Activity marked completed with summary in output

### Key Files

| File | Purpose |
|------|---------|
| `packages/ai/src/tasks/meetingStart.ts` | `activityCron` (generic dispatcher) + `meetingStart` handler |
| `packages/ai/src/tasks/activityExecution.ts` | Inngest handler for non-meeting/non-notification activities |
| `packages/ai/src/tasks/meetingHelper.ts` | generateText helpers for each turn |
| `packages/ai/src/tasks/meetingAgents.ts` | Hardcoded Meeting Master + Summary Agent prompts |
| `packages/ai/src/tools/planning/schedule-meeting.ts` | `planning.schedule_meeting` tool |
| `apps/web/src/app/api/meetings/` | Meeting API routes |
| `apps/web/src/components/meeting-schedule-form.tsx` | Scheduling form component |
| `apps/web/src/components/meeting-viewer.tsx` | Read-only transcript viewer |

### Conversation Types

The `conversations` table has a `type` column: `'chat'` (default) or `'meeting'`. Meeting conversations are excluded from the chat sidebar (`findByUserId` filters `WHERE type = 'chat'`).

## File Storage (Cloudflare R2)

Files and images are stored in **Cloudflare R2** (S3-compatible). No files are stored locally or in the database — only metadata is persisted in the `files` table.

### Architecture

```
packages/backend/src/
  helpers/storageHelper.ts    → R2 client wrapper (uploadToStorage, deleteFromStorage, getSignedUrl)
  repositories/fileRepository.ts → CRUD for files table
  services/fileService.ts     → Upload/list/get/update/delete with validation + signed URLs
```

### File Categories

Files are organized by `category`: `avatar`, `agent_avatar`, `chat_image`, `document`, `attachment`.

### Supported File Types

- **Images** (10 MB max): JPEG, PNG, GIF, WebP, SVG
- **Documents** (25 MB max): PDF, DOCX, TXT, CSV

### Signed URLs

Files are never served via public URLs. All access uses **pre-signed URLs** generated on the fly (1-hour expiry). The `files` table stores a `storage_key` (R2 object path), not a URL.

### Upload Flow

1. Client sends `multipart/form-data` to `POST /api/files` with `file`, `category`, and optional `metadata`
2. Service validates MIME type and size
3. File is uploaded to R2 at `users/{userId}/{category}/{uuid}.{ext}`
4. Metadata is saved to the `files` table
5. Response includes the file record + a signed URL

### AI Agent Tools

Agents can manage files via 5 tools in `packages/ai/src/tools/files/`:
- `files.upload_file` (approval required) — base64-encoded content
- `files.list_files` — optional category filter
- `files.get_file` — returns metadata + signed download URL
- `files.update_file` (approval required) — update metadata (alt text, description, etc.)
- `files.delete_file` (approval required) — permanent deletion

### Environment Variables

```
R2_ACCOUNT_ID=        # Cloudflare account ID
R2_ACCESS_KEY_ID=     # R2 API token access key
R2_SECRET_ACCESS_KEY= # R2 API token secret
R2_BUCKET_NAME=       # Bucket name (e.g. community-files)
```

## Notifications

In-app notifications generated by AI agents via tools, with optional Web Push delivery for installed PWA.

### Architecture

```
packages/backend/src/
  repositories/notificationRepository.ts      → CRUD for notifications table
  repositories/pushSubscriptionRepository.ts  → Web Push subscription storage
  services/notificationService.ts             → Create (+ push delivery), list, markRead, delete
  helpers/pushHelper.ts                       → web-push VAPID delivery
packages/ai/src/tools/notifications/          → notifications.send_notification + notifications.schedule_notification tools
packages/ai/src/tasks/notificationExecution.ts → Inngest handler for scheduled notification delivery
apps/web/src/app/notifications/               → Notifications page
apps/web/src/components/notification-*.tsx     → Badge, item, list, home section
apps/web/public/sw.js                         → Service worker (push + notificationclick)
apps/web/public/manifest.json                 → PWA web app manifest
```

### Notification Types

`info` | `success` | `warning` | `meeting` | `agent` | `scheduled` — used for icon/color differentiation in the UI.

### Scheduled Notifications (Reminders)

Users can schedule reminders via chat ("remind me at 3pm to..."). The `notifications.schedule_notification` tool creates a `scheduled_notification` activity in the `scheduled_activities` table. The `activityCron` (runs every minute) picks it up when due and emits a `notification/ready` Inngest event. The `notificationExecution` handler then delivers the notification (in-app + push).

### Push Notifications (PWA)

- Web Push via VAPID keys and the `web-push` npm package
- Push subscriptions stored in `push_subscriptions` table (per user, per device)
- Every `notificationService.create()` call also fires a push to all user devices (fire-and-forget)
- Service worker at `public/sw.js` handles `push` and `notificationclick` events
- `PushNotificationManager` component in root layout registers SW and manages subscriptions

### Environment Variables

```
VAPID_PUBLIC_KEY=               # Generated once via web-push generate-vapid-keys
VAPID_PRIVATE_KEY=              # Generated once
VAPID_SUBJECT=                  # mailto: URI (optional, defaults to mailto:admin@community.app)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=   # Same as VAPID_PUBLIC_KEY (exposed to client)
```

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
