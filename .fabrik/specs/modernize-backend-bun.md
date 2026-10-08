# Modernize TabDash Backend to Native Bun, bun:sqlite & TS Styleguide

## Problem Statement

The current backend in `backend/` was scaffolded in 2023 with legacy tooling that is inefficient, fragile, and out of step with the rest of the workspace:

1. **Legacy Nitro Framework (`nitropack: ^1.0.0`)**: Relies on implicit global auto-imports (`eventHandler`, `getQuery`, `useStorage`, `setResponseStatus`), breaking strict TypeScript checks (`tsc --noEmit` fails with 40+ TS errors).
2. **Node Runtime Dependency**: Production build outputs a Node bundle (`.output/server/index.mjs`) executed via `node`. The Dockerfile uses `node:alpine` and `npm install` / `npm run build`.
3. **Inefficient Storage (`unstorage` with JSON files)**:
   - Partitioned and unpartitioned JSON files with no concurrency control or indexing.
   - `stats.json` loads the entire file into memory and pushes IDs into arrays on every request, which degrades in performance, risks file corruption on concurrent writes, and leaks memory.
4. **Dead / Unused Dependencies**: `vitest` is declared in devDependencies while tests use `bun:test`. `unstorage` pulls unnecessary node-fs abstractions.
5. **Toolchain Inconsistency**: Does not follow the `ts-styleguide` (Bun native runtime, strict TypeScript, Oxc lint/format, zero bloat, native web standards).

## Proposed Solution

### 1. High-Performance Native Database (`bun:sqlite`)

- Utilize Bun's zero-dependency, native C-powered `bun:sqlite`.
- WAL (Write-Ahead Logging) mode with normal sync for microsecond query latency and high concurrency.
- **Schema**:
  - `settings` table: `(key TEXT PRIMARY KEY, data TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`
    - Instant indexed B-tree key lookup.
    - Atomic upsert handling returning created vs patched.
  - `installations` table: `(id TEXT PRIMARY KEY, browser TEXT NOT NULL, installed_at INTEGER NOT NULL, deinstalled_at INTEGER)`
    - Instant index on `browser`.
    - Single SQL aggregation query for statistics (`COUNT(*)` installs and `COUNT(deinstalled_at)` deinstalls per browser).
  - Test support: instant in-memory database (`new Database(':memory:')`) for zero-I/O test execution.

### 2. Native `Bun.serve` Web Standards Server

- Eliminate Nitro, unstorage, and Vitest.
- Modern `Bun.serve` running directly from TypeScript (`bun src/index.ts`) in dev, test, and production.
- Full CORS support (`OPTIONS` preflight + headers).
- Clean routing for:
  - `GET /health` -> 200 `{ status: 'ok', uptime }`
  - `GET /api/storage?key=...` -> 200 decrypted JSON, or 400/401/404/500
  - `POST /api/storage?key=...` -> 201 created or 200 patched
  - `GET /api/install?id=...&browser=...` -> 201 created
  - `GET /api/deinstall?id=...&browser=...` -> 200 updated
  - `GET /api/statistic` -> 200 aggregate stats
  - Optional alias `/api/setting/:key` for companion/extension compatibility
- Zero compilation step, instant cold start (<5ms).

### 3. Preserved Crypto Interoperability

- Retain AES encryption/decryption in `src/utils/crypto.ts` with `crypto-js` to preserve wire format and password compatibility.

### 4. Strict TypeScript & Oxc Alignment (`ts-styleguide`)

- Clean `backend/tsconfig.json` extending `../tsconfig.base.json` with `bun-types`.
- Strict type safety (0 `any`, `verbatimModuleSyntax: true`, `noUncheckedIndexedAccess: true`).
- Zero Oxc warnings or errors (`oxlint` + `oxfmt`).

### 5. Ultra-Lightweight Containerization

- Update `backend/Dockerfile` to `oven/bun:1-alpine`.
- Direct `CMD ["bun", "src/index.ts"]`.
- Image size drops from ~180MB to ~80MB with no Node.js runtime overhead.

## Verification

- `bun test` in `backend/` (all unit, storage, and HTTP server tests pass)
- `bun ./node_modules/typescript/bin/tsc --project backend/tsconfig.json --noEmit` (0 type errors)
- `bun ./node_modules/oxlint/bin/oxlint backend` (0 lint errors/warnings)
- `bun ./node_modules/oxfmt/bin/oxfmt --check backend` (0 format errors)
- Verified curl/HTTP requests matching `backend/test.http`
