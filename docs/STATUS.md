# Status — 18 November 2026

Snapshot of `main` at `e5169d3` (last commit 10 Nov 2026). Written from the code, git history, CI runs and a local `npm audit`.

## What is live

**Nothing is deployed.** There is no hosting, no homepage link and no live URL. The app runs locally with `npm run dev`. Everything is stored on the device in IndexedDB; there is no server sync, and sign-in for real shops is not wired up.

## What works today (Phases 0 and 1, merged 9 to 10 Nov 2026)

- Double-entry ledger engine in integer paisa, with consignment, dues and reversing entries.
- First launch with a real, empty shop instead of seeded demo data ([#8](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/8)).
- Local persistence in IndexedDB with migration from the old `localStorage` data ([#7](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/7)).
- Void or correct any entry with a reversing entry ([#9](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/9)).
- One-tap JSON backup and restore ([#10](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/10)).
- Bangla digits parse correctly; `audit()` never throws on a malformed entry ([#11](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/11), [#12](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/12)).
- Edit and archive parties and products, phone number on a party ([#13](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/13)).
- Reports v1: daily close, month profit and loss, dues aging ([#14](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/14)).

## Checks

On 18 Nov 2026 `npm run typecheck`, `lint`, `test` (75 tests in 7 files) and `build` all pass. CI (`ci`) is required on `main`.

## Open pull requests

Five Dependabot PRs, open since 9 Nov: [#2](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/2) (react-accordion), [#3](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/3) (tailwindcss), [#4](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/4) (typescript-eslint) and [#6](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/6) (eslint-plugin-prettier) are green. [#5](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/5) (`@eslint/js` 10) fails install because the repo is on ESLint 9. Tracked in [#16](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/16).

## Security

`npm audit --omit=dev` reports 20 vulnerabilities (3 critical, 13 high, 2 moderate, 2 low), including `better-auth` advisories and dev-only `vitest` ones. GitHub shows no alerts because Dependabot alerts are off. Tracked in [#15](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/15).

## Known gaps

- Offline app shell implemented ([#17](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/17)): manifest, maskable icons, versioned service worker, offline page and an honest device-only status strip. Real-device Android installability and a deployed origin are still unverified; see [PWA.md](PWA.md).
- No server-side ledger tables or sync; only an auth migration exists ([#21](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/21)).
- Ledger has only example-based tests; property tests are required by CONTRIBUTING ([#18](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/18)).
- Phase 0 exit gate (10 shop-owner interviews logged) is not met; the README still said "Phase 0 in progress".
- The "SSOT" document cited in the ADRs and code is not in the repo.
- ADR D-03 (licence) is still proposed. All rights reserved meanwhile.
- CI uses `npm install` and `vercel.json` has an install command that probably breaks a real build ([#20](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/20)).

## Relationship to voicebooks-ai

Same product, earlier name. The private `voicebooks-ai` repo holds the legacy Python/SQLite MVP, a fictional browser demo and the first V2 blueprint (Next.js, Supabase, Cloud STT). This repo took a different stack. Which path is canonical is Fahad's call ([#19](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/19)).
