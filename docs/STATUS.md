# Project status — 21 November 2026

**Repository:** `FahadIbrahim93/Hishabh-Sathi` (active product build). `voicebooks-ai` is earlier reference/prototype only.

**Readiness verdict:** **pre-production**. There is no verified live deployment, merchant adoption, field voice benchmark, production server ledger/sync, or real-phone QA sign-off. Passing code checks do **not** imply those milestones.

## Verified code/CI baseline

- Inspected main SHA: [`da0b35d`](https://github.com/FahadIbrahim93/Hishabh-Sathi/commit/da0b35dad9bdab2efbd61778ac96ae3ae21e6c1a).
- [Hosted CI on main](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44834750585): **success**.
- [Hosted dependency and PostgreSQL auth verification on main](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44834750266): **success**.
- `SESSION.md` records 110/110 tests in 13 files and zero npm audit findings after the dependency remediation; the post-merge main workflows above also succeeded. Avoid claiming that all possible transaction paths or phone devices were tested.
- [PR #42](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/42), adding ledger property and merchant-facing checks, is **open** with passing hosted checks at `47ffcd32`; it is not yet merged. Tracked in [#18](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/18).

## Implemented, with evidence boundaries

| Area | What is currently evidenced | Remaining limitations |
| --- | --- | --- |
| Ledger and local UI | Double-entry events, purchases, sales, consignment, collections, reversals, catalog and reports (Phase 1, #7–#14) | Financial edge cases #35–#39 and #41 remain open |
| Device durability | Receipts (#24), startup reads (#26), manual restore (#29), one reversal per original (#31), catalog/first run (#33) protected by tests and merges | Real Android QA, long-term data survival and recovery drill not signed off (#43) |
| Dependency and CI | Security upgrades (#34), lockfile/audit/Chrome/Bangla-font CI gate (#40) merged | Historical Dependabot branches now require re-triage (#16); monitor future advisories |
| Offline operation | IndexedDB on-device book storage | No installable offline shell/service worker (#17); clearing browser data can lose unsynced books |
| Server auth | PostgreSQL 16 schema and auth flow exercised in hosted integration test (#34) | No deployed login/merchant OTP, tenant-ledger service or cross-device sync (#21) |
| Voice | Browser recognition exploration exists | No proven transcription or correct money-field benchmark (#44) |
| Market/compliance | Distributor use case and reference research | No recorded 10 interviews, five-shop pilot, or tax/VAT sign-off (#19, #45, #46) |

## Confirmed open blockers, in dependency order

1. **Verify property baseline:** #18 / PR #42. Close only after merge and fresh main CI.
2. **Financial correctness and explicit accounting policy:** #39 fractional taka; #35 drawer funding/negative cash; #36 customer credits after reversed sales; #37 weighted cost after purchase reversal; #41 returnable stock after reversal; #38 aging allocation/archived dues. These are separate observed defects, **not fixed by** #42.
3. **Offline and device safety:** #17, #43. Do not mistake local data persistence for a genuine offline install or disaster-recovery guarantee.
4. **Product validation:** #44 voice benchmark, #45 one distributor + five shops, with synthetic data and consent rules.
5. **Founder decisions and later platform:** #19 (architecture confirmation, license, hosting, interviews, SSOT and policy), #21 (blocked Phase 2 server sync/OTP), #46 release readiness.
6. **Dependency maintenance:** #16. Four old open Dependabot PRs (#2, #3, #5, #6); #4 was closed without merge after the direct security upgrade superseded it. Old green checks are stale.

## Evidence still missing

- No real-phone/browser test matrix with committed-book parity and recovery demonstration.
- No actual SMS, cross-device synchronization, per-business production authorization or production hosting evidence.
- No accepted accuracy threshold for Bangla speech-to-financial-fields, dialect/noise performance, or explicit voice confirmation workflow.
- No documented ten shop-owner interviews and no successful distributor-plus-five-shops reconciliation pilot.
- No production privacy/security, data protection, VAT interpretation or launch approval.

## Next operational step

Review PR #42 without broadening it into financial behavior changes, verify current main after merge, and then address the accounting defects one issue at a time with founder decisions where required. Record each failing reproduction, acceptance tests, results, rollback and merged-main verification in `SESSION.md`.

**For the full execution sequence, use [ROADMAP.md](ROADMAP.md).** This document supersedes the outdated 18 November status snapshot.
