# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev            # Run the API with nodemon + tsx, loads .env (the only way to run the server)
yarn db:generate    # Generate a Drizzle migration from schema changes in src/services/db/schemas
yarn db:migrate     # Apply pending migrations to the database
```

There is **no build, lint, or test setup** (`yarn test` is a placeholder that exits 1). Code runs directly via `tsx` — there is no compile step. Type errors only surface at runtime or in the editor.

## Runtime & module system

- **Pure ESM** (`"type": "module"`, `tsconfig` `module`/`moduleResolution`: `nodenext`). **Every relative import must use a `.js` extension**, even though the source files are `.ts` (e.g. `import { db } from "../../index.js"`). Omitting `.js` breaks resolution.
- `.env` is loaded by the `dev` script (`--env-file`) and by `drizzle.config.ts`/`drizzle-seed` via `dotenv`. See `.env.template` for required variables.
- In development the server also opens an ngrok tunnel (`NGROK_DOMAIN`, `NGROK_AUTHTOKEN`) so the public webhook/origin URL is stable.

## Architecture

Three-layer request flow. Keep the layers separate — routers never touch the DB directly, actions never touch `req`/`res`.

```
src/routers/  →  src/actions/  →  src/services/db/queries/  →  Drizzle/Postgres
 (HTTP I/O)      (validate +        (data access)
                 orchestrate)
```

### Routers (`src/routers/`)
- **File-based routing that mirrors the URL.** Directory and file names map to path segments; dynamic segments use bracket folders like `[projectId]`/`[taskId]` (e.g. `routers/projects/[projectId]/tasks/[taskId]/index.ts`). All sub-routers are wired together in `routers/index.ts`, mounted under `/api`.
- Every `Router` is created with `Router({ mergeParams: true })` so nested params (`req.params.projectId`, etc.) are visible.
- Route handlers are thin: pull data off `req`, call an action, and `res.status(status).send(...)`. They wrap the action call in try/catch and destructure `{ status, error }` from the thrown object with fallback defaults (see the pattern in `routers/projects/index.ts`).
- Protected routes pass `verifyToken` as middleware before the handler.

### Actions (`src/actions/`)
- Each action is an async function that validates input (Zod), calls one or more DB queries, and **returns a plain object `{ status, message, ...payload }`** using the `HTTP_STATUSES` constants from `src/actions/HTTP_STATUSES.ts`.
- **Error convention:** on failure, actions `throw { status, error }` (note `error`, not `message`). `ZodError` is caught and re-thrown as `{ status: BAD_REQUEST, error: issues.map(i => i.message) }`. Routers rely on this shape. The `APIResponse<T>` helper type lives in `routers/types.ts`.
- Actions are re-exported through barrel `index.ts` files up to `src/actions/index.ts`; import them from there.

### Services (`src/services/`)
- `db/` — Drizzle + node-postgres. `db/index.ts` creates the `Pool` (SSL via `ca.pem`) and the `db` instance, and re-exports schemas and queries.
  - `schemas/` — one `pgTable` per file, all re-exported from `schemas/index.ts` (this file is the `schema` entry in `drizzle.config.ts`). Tables conventionally carry `createdDate`/`updatedDate`/`createdBy` and soft-delete columns `deletedDate`/`deletedBy`.
  - `relations/` — Drizzle relations, merged into the query client alongside schemas.
  - `queries/` split into `insert/`, `select/`, `update/`, each with a barrel `index.ts`. Multi-table writes use `db.transaction(...)` (see `insertProject.ts`, which also resolves the user's personal company on the fly). Query prop types are derived from `typeof Table.$inferInsert`.
  - `constants.ts` holds shared `as const` enums (permission actions, location/task/sequence/relationship types).
- `auth/` — `verifyToken` middleware reads a **signed cookie** named `auth`, verifies the JWT, loads the user via `getUserById`, and attaches `req.user`.
- `files/` — `StorageService` (singleton `fileService`) wraps Backblaze B2 with separate public/private buckets. Uploads go through Multer memory storage; `fileMiddleware.ts` exports `singleFileHandler`/`multiFileHandler` which **validate real MIME type from the file buffer** (via `file-type`), not the client-provided type. Private files are served through short-lived signed download/preview URLs.
- `email/` — one function per transactional SendGrid email. `maps/` — Mapbox geocoding (mounted as middleware at `MAPS_PATH`). `formatting/` — HTML→plaintext helpers.

## Conventions

- Barrel `index.ts` files at every layer; import from the nearest barrel rather than deep paths.
- DB is hosted (Aiven Postgres) and requires SSL — `ca.pem` is read at startup and is gitignored along with `.env` and `*.pem`.
- Migrations live in `drizzle/`; regenerate them with `yarn db:generate` after editing any schema file rather than hand-writing SQL.
