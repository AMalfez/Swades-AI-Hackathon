# Reliable Recording + Chunk Transcription

A monorepo app that records audio in the browser, chunks it into 5-second WAV segments, and sends each chunk to a backend service for transcription.

## How It Works

```
Client (Browser)
    │
    ├── 1. Record & chunk data on the client side
    ├── 2. Store chunks in OPFS (Origin Private File System)
    ├── 3. Upload chunks to a storage bucket
    ├── 4. On success → acknowledge (ack) to the database
    │
    └── Recovery: if DB has ack but chunk is missing from bucket
        └── Re-send from OPFS → bucket
```

**Main objective:** In all cases, the recording data stays accurate. OPFS acts as the durable client-side buffer — chunks are only cleared after the bucket and DB are both confirmed in sync.

### Flow Details

1. **Client-side chunking** — Recording data is split into chunks in the browser
2. **OPFS storage** — Each chunk is persisted to the Origin Private File System before any network call, so nothing is lost if the tab closes or the network drops
3. **Bucket upload** — Chunks are uploaded to a storage bucket (can be a local bucket for testing, e.g. MinIO or a local S3-compatible store)
4. **DB acknowledgment** — Once the bucket confirms receipt, an ack record is written to the database
5. **Reconciliation** — If the DB shows an ack but the chunk is missing from the bucket (e.g. bucket purge, replication lag), the client re-uploads from OPFS to restore consistency

## Tech Stack

- **Next.js** — Frontend app router and UI
- **Hono** — Backend API server
- **Bun** — Runtime for the server
- **OpenAI** — Whisper transcription service
- **PostgreSQL / Drizzle ORM** — database package support
- **TailwindCSS + shadcn/ui** — UI components
- **Turborepo** — monorepo task orchestration

## Getting Started

Install dependencies from the monorepo root:

```bash
npm install
```

### Configure environment

Update `apps/server/.env` with:

- `DATABASE_URL` — your PostgreSQL connection string
- `CORS_ORIGIN` — e.g. `http://localhost:3001`
- `NEXT_PUBLIC_SERVER_URL` — e.g. `http://localhost:3000`
- `OPENAI_API_KEY` — your OpenAI API key

### Run the app

From the repo root:

```bash
npm run dev
```

Or run only one package:

```bash
npm run dev:web
npm run dev:server
```

- Web app: `http://localhost:3001`
- API server: `http://localhost:3000`

## Notes

- The current implementation does not perform speaker diarization.
- Overlapping speech in a single mixed chunk may be transcribed as mixed text.
- The backend uses an OpenAI Whisper transcription endpoint at `/transcribe`.

## Project structure

```
apps/
  web/          # Next.js frontend
  server/       # Hono backend API
packages/
  ui/           # shared UI components
  db/           # Drizzle ORM schema and database tools
  env/          # environment schema and config
  config/       # shared TS configuration
```

## Useful scripts

- `npm run dev` — start all apps in development mode
- `npm run build` — build all apps
- `npm run dev:web` — start only the web app
- `npm run dev:server` — start only the server
- `npm run check-types` — run type checking
- `npm run db:push` — push database schema changes
- `npm run db:generate` — generate database client/types
- `npm run db:migrate` — run database migrations
- `npm run db:studio` — open database studio UI
- `npm run check` — run Ultracite lint checks
- `npm run fix` — auto-fix formatting/lint issues

