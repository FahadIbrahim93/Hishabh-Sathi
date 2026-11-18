# Hishab Sathi — হিসাব সাথী

Bangla-first, offline-first bookkeeping and stock for Bangladeshi distributors, wholesalers and small retail shops.

> আপনার দোকানের হিসাব, হিসাবের ভাষায়। কখনও হারাবে না, কখনও মিলবে না এমন হবে না।

## What it is

The owner speaks or taps a transaction in plain Bangla, the app reads it back, and nothing changes until they confirm. Under the hood is a correct double-entry ledger, so the numbers can be trusted by the owner, their accountant, their bank and the tax office.

The differentiator:

- **Consignment done right** — goods left at a shop are not a sale and not a receivable until they sell.
- **Dues (বাকি) tracking** — who owes how much, and since when, per shop.
- **Immutable history** — entries are never edited or deleted; mistakes are fixed with a reversing entry.
- **Offline first** — works with no network; sync is the backup and the bridge between devices, never a dependency.
- **Never lose data** — backup before features.

## Tech stack (baseline)

- Client: React app on TanStack Start + TanStack Router, IndexedDB local store. The PWA manifest and service worker are not built yet.
- Server: TypeScript on Node, Postgres (Kysely), phone + OTP auth (Better Auth)
- Ledger: append-only events, idempotent `apply`; all money in integer paisa (BDT)

See `docs/adr/` for the architecture decisions (D-01 to D-04).

## Repo status

Pre-production, nothing deployed. Phases 0 and 1 are merged (ledger engine, on-device storage, reversals, backup and restore, catalog editing, reports). Next: security fixes, offline install, then server sync. See [docs/STATUS.md](docs/STATUS.md) and [docs/ROADMAP.md](docs/ROADMAP.md). Decisions are in `docs/adr/`; coding agents start with [AGENTS.md](AGENTS.md).

This is the same product as the private `voicebooks-ai` repo (its earlier name and Python MVP).

## Run locally

Requires Node.js 22+ and npm.

```bash
npm ci
npm run db:migrate      # skipped unless DATABASE_URL is set; PGLite fallback applies migrations locally
npm run dev             # http://0.0.0.0:8080
```

## Test

```bash
npm test           # vitest run — includes the ledger engine tests
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run build      # Vite build + migrations
```

## License

No licence selected yet (decision D-03 is open). Until one is chosen, all rights reserved — do not copy or redistribute.

## Contributing

See `CONTRIBUTING.md`.
