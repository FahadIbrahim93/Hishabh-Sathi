# Roadmap — 18 November 2026

Remaining work in priority order. Each item has an issue with acceptance criteria. Items marked **suggestion** are ideas, not commitments. Take the top `agent-ready` issue unless Fahad says otherwise.

| # | Item | Priority | Who |
| --- | --- | --- | --- |
| 1 | [#15](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/15) Triage and fix the `npm audit` findings (3 critical, 13 high), starting with `better-auth` | high | agent |
| 2 | [#19](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/19) Owner decisions: canonical stack, licence, hosting, interviews, SSOT doc, Dependabot alerts | high | Fahad |
| 3 | [#17](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/17) Real PWA: manifest and service worker, offline load | med | agent |
| 4 | [#18](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/18) Property tests for the ledger engine | med | agent |
| 5 | [#21](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/21) **Suggestion:** Phase 2 first slice, server event sync and phone OTP. Blocked on #19 | med | agent, after #19 |
| 6 | [#16](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/16) Triage the five Dependabot PRs; Fahad merges | low | agent, then Fahad |
| 7 | [#20](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/20) CI hygiene: `npm ci`, permissions, Vercel install command | low | agent |

## Other suggestions

- Add a Playwright smoke test that records a sale, reloads and checks the dues screen (the repo has `scripts/browser-smoke.mjs` as a start).
- Log the shop-owner interviews in `docs/research/` as they happen; the competitor table is already there.
- Voice entry (`src/lib/hishab/voice.ts`) uses the browser's recogniser. A Bangla speech-to-text benchmark is described in the `voicebooks-ai` docs; do not build on it before #19 is decided.

## Done

Phase 0 foundations (#1) and Phase 1: persistence, onboarding, reversals, backup, input and failure safety, catalog editing, reports (#7 to #14).
