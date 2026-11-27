# Hishab Sathi — হিসাব সাথী

**VoiceBooks AI's active implementation by Hope Theory Labs.** A Bangla-first bookkeeping assistant for Bangladeshi small businesses, starting with distributors, wholesalers and local shops.

**Product goal:** An owner should be able to record a purchase, sale, consignment delivery, collection or expense in familiar Bangla without needing to understand accounting. Confirmed transactions should generate trustworthy stock, dues and double-entry books. **Voice-first entry is the product direction, not a field-verified production capability.**

> Current release status (21 November 2026): **pre-production, not deployed and not ready for real merchant books.** Follow [status](docs/STATUS.md), [roadmap](docs/ROADMAP.md) and [open issues](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues).

## What is implemented

- Bangla-first transaction and catalog UI; onboarding without automatically inserting a fictional business.
- Append-only double-entry journal with money in integer paisa, stock movements, credit sales, collections and consignment workflows. **Some financial edge cases remain open**; see #35–#39 and #41.
- Local IndexedDB persistence with legacy localStorage migration.
- Reversal/correction entries; guards against duplicate corrections and unsafe writes.
- JSON backup/restore with validation and durable-device-write confirmation.
- Customer and product management, daily and monthly reports, and dues aging (aging edge cases are **not yet resolved**).
- Typecheck, lint, test, production build, hosted dependency/security checks and PostgreSQL auth-schema integration tests.

### Important limits

- **Not hosted.** There is no verified live app or production database.
- **Not an installable offline PWA yet.** Books are saved locally, but app-shell offline reopening, service worker and installability remain in [#17](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/17).
- **No cross-device sync or merchant OTP.** A PostgreSQL auth test is not a production login or sync service. See [#21](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/21).
- **Bangla speech is experimental/unbenchmarked.** Never assume an ambiguous voice command has entered the ledger; explicit review and confirmation are part of the target design. See [voice acceptance issue](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/44).
- **Tax/VAT compliance is not verified.** Reporting is not tax advice or an approved statutory filing workflow.
- **Local data can still be lost** if device/browser storage is cleared or lost and no usable backup exists. Do not use for real merchant records before recovery/device QA.

## Engineering checkpoint — 21 November 2026

Current inspected main: `da0b35d`. Hosted [CI](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44834750585) and [dependency/auth verification](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44834750266) succeeded at that commit. The last recorded local upgrade verification in `SESSION.md` was 110/110 tests and zero npm audit advisories. These are engineering checks **not** launch or field quality certification.

- Merged safety work: receipt durability (#24), startup recovery (#26), validated restore (#29), duplicate reversal protection (#31), catalog durability (#33), dependency/auth audit (#34) and CI hardening (#40).
- [PR #42](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/42) adds property/merchant-facing checks and has passing hosted checks, but is **open** at this checkpoint.
- Priorities: finalize property baseline (#18), resolve financial defects (#39, #35, #36, #37, #41, #38), perform genuine offline/device QA (#17, #43), validate Bangla voice (#44), and execute a controlled merchant pilot (#45). Hosting/sync requires founder decisions (#19, #21) and release sign-off (#46).
- Four older Dependabot PRs need re-triage (#16). Do not merge stale red dependency changes.

See [full current status](docs/STATUS.md) and [sequenced implementation roadmap](docs/ROADMAP.md). For financial/data changes, **failing regression first, then fix, then verified CI/main and documented rollback**.

## Architecture (current code versus planned services)

- **Client:** React / TanStack Start / TanStack Router; IndexedDB using `idb`; Bangla-first screens.
- **Ledger:** append-only event model, idempotent application, integer paisa, consignment explicitly separate from completed sales.
- **Server (planned):** TypeScript, Kysely + PostgreSQL event sync, per-merchant isolation, Better Auth phone OTP. The auth schema has integration checks; production sync and OTP are not implemented.
- **Voice (unvalidated):** browser speech recognition exploration; real-world transcription, dialect handling, confirmation, device coverage and cost must be benchmarked before claims.

Decisions: [ADRs](docs/adr/). Agent operating rules: [AGENTS.md](AGENTS.md). Critical business decisions: [#19](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/19).

## Run locally

Requires Node.js 22+ and npm:

```bash
npm ci
npm run db:migrate  # skips remote DB work if DATABASE_URL is unset
npm run dev         # http://localhost:8080
```

Use **synthetic test data only** until device recovery and merchant-consent gates have passed.

## Verify locally

```bash
npm run typecheck
npm run lint
npm test
npm run test:ci
npm run build
npm run audit
```

Some browser tests need correctly provisioned Chromium and Bangla fonts; do not mistake a skipped browser spec for a passed check. Refer to the hosted CI gate for validated provisioning.

## Project identity and license

`FahadIbrahim93/Hishabh-Sathi` is the **active implementation**. The private `voicebooks-ai` repository contains the earlier Python/SQLite MVP and reference research; its Next.js/Supabase/STT blueprint must not silently override the accepted codebase/ADRs.

No open-source license has been approved (D-03 remains proposed). **All rights reserved** until the owner decides. See [CONTRIBUTING.md](CONTRIBUTING.md).
