# D-01: Offline-first PWA, IndexedDB local store, append-only event sync to Postgres

**Status:** Accepted  
**Date:** 2026-11-10  
**Owner:** Fahad Ibrahim

## Context

The prototype keeps all data in one browser's `localStorage` — clear the browser, lose the business. The SSOT target architecture requires offline-first with a server as backup and bridge between devices, not a dependency. The repo already ships TanStack Start, Better Auth, Kysely and PGLite.

## Decision

- Client: installable React PWA (TanStack Start + TanStack Router).
- Local working database per device: IndexedDB (Dexie or `idb`); entries stored as append-only events.
- Sync: each device pushes new entries to the server and pulls others. Entry identity: `id` (UUID v7), `deviceId`, `businessId`, `seq`, `at`, `createdBy`. The ledger engine's existing idempotent `apply` is the merge rule, so sync converges as a set union of events.
- Server: TypeScript on Node, Postgres (Kysely), hosted on managed Postgres in a Bangladesh-near region (Singapore/Mumbai to start); web on Vercel.
- Auth: phone number + OTP (see D-04).

## Consequences

- Works fully offline; data loss on one device is recovered from the server or another synced device.
- Undo is free: a reversal is just another append-only event.
- Migration path: existing `localStorage` (`hishab-sathi-v1`) data migrates into IndexedDB on first load (Phase 1).

## References

- SSOT §5.1 (decision D-01), §5.3 data model, §7 Definition of Done.
