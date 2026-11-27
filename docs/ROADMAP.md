# Delivery roadmap — ordered implementation gates

**Updated 21 November 2026** · Active repo: `FahadIbrahim93/Hishabh-Sathi` · Product: Hishab Sathi / VoiceBooks AI.

The intended audience is Bangla-speaking small businesses, beginning with a lighter distributor and local shops. The objective is **trustworthy money, stock, consignment and dues before advanced AI or SaaS scale**. No stage is marked done merely because a PR exists or a local test passed.

## Gate 0 — Establish one trusted baseline (current work)

- [ ] Review [PR #42](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/42) for property/merchant-facing tests and close [#18](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/18) **only after merge and main CI**.
- [x] Merge verified durability improvements (#24, #26, #29, #31, #33).
- [x] Merge dependency/auth verification (#34) and robust lockfile/Chromium CI (#40).
- [ ] Triage [#16](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/16) separately; avoid mixing dependency updates into financial corrections.
- [ ] Capture exact main SHA and CI evidence after every merge in `SESSION.md`.

**Exit:** current main is green; test baseline is unambiguously identified; no open property PR ambiguously counted as shipped.

## Gate 1 — Correct the accounting model (blocker to real data)

Apply **one behavior change per reviewed PR**, with an explicit failing test before the fix, ledger invariant/properties afterward, rollback notes, old-data compatibility, and signed-off business rule where relevant.

| Order | Issue | Why |
| --- | --- | --- |
| 1 | [#39](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/39) | Fix or explicitly define paisa precision before relying on downstream amounts |
| 2 | [#35](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/35) | Establish cash drawer funding and avoid unexplained negative cash |
| 3 | [#36](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/36) | Resolve customer credit/refund/reallocation semantics after reversed collected sales |
| 4 | [#37](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/37) | Restore correct inventory valuation/cost after reversed purchases |
| 5 | [#41](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/41) | Prevent reversals and sold returns from minting returnable stock |
| 6 | [#38](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/38) | Age remaining dues correctly, include archived parties and reconcile total positives |

Founder sign-off required for policy choices in #35, #36, #38 and #39; [#19](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/19) tracks those approvals.

**Exit:** synthetic books reconcile across journal, cash, inventory, profit and shop dues after retries, reversals, returns and partial payments.

## Gate 2 — Reliable on-device experience and recovery

- [ ] [#17](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/17): installable PWA, service worker/app shell, honest offline status and no unsafe server caching.
- [ ] [#43](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/43): Android browser QA, money-flow reconciliation, failed save/stale-tab tests and export/import recovery drill.
- [ ] Accessibility, Bengali font/readability, large touch targets, low-end-device smoke and practical backup instructions.

**Exit:** evidence from an actual Android device, not only a simulated browser. No "never lose data" claim before recovery is proven.

## Gate 3 — Prove the merchant experience

- [ ] [#44](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/44): Bangla voice-to-structured-draft accuracy with explicit human confirmation and manual fallback. This can be independently benchmarked; **do not** block manual-entry pilot on unvalidated STT.
- [ ] [#45](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/45): consent-based distributor + five-shop reconciliation pilot, starting on synthetic data. Compare records against an independent manual ledger.
- [ ] [#19](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/19): log the research gate (10 owner interviews) or deliberately revise it.

**Exit:** owner can use the product accurately, correct mistakes, recover data and understand stock/dues without accounting training. Measured feedback and discrepancies are documented.

## Gate 4 — Expand from local product to multi-device SaaS (approval-dependent)

- [ ] Founder approves final architecture, hosting cost, licence, privacy, SMS plan and current SSOT (#19).
- [ ] [#21](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/21): tenant-isolated append-only server events, idempotent push/pull, durable offline queue, honest per-entry sync state and stock-conflict tasks.
- [ ] Verify real OTP only with approved provider/cost; auth schema checks are not equivalent to live merchant authentication.
- [ ] Separate backup/sync operations, migration, support, usage limits and subscriptions into scoped PRs after field evidence justifies them.

**Exit:** two devices converge without duplication, business data is isolated, and failure/recovery is observable and testable.

## Gate 5 — Controlled preview and release

- [ ] [#46](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/46): secure preview, threat model, privacy, audit, recovery, monitoring, rollback and owner go/no-go sign-off.
- [ ] Tax/VAT calculations or exports undergo separate jurisdiction-specific review before any statutory compliance claim.
- [ ] No production merchant books, paid service provisioning or public availability promises without explicit owner approval.

## Engineering rules for every task

1. Read `SESSION.md`, the relevant issue and ADR/SSOT input.
2. State scope, expected invariant and failing reproduction (tests first for behavior bugs).
3. Make the smallest reviewable change; avoid cross-task refactors and mixed code/dependency work.
4. Run `npm ci`, typecheck, lint, non-skipping hosted CI tests, build and audit; perform real-device evidence where required.
5. Review changes and rollback; merge only when required checks are green and scope is approved.
6. Re-check merged **main**, link the proof to the issue, and update `SESSION.md`. Close only completed work.

**Scope discipline:** `voicebooks-ai` is a legacy prototype; do not treat its Next.js/Supabase plan as code deployed here. No real business data in CI, issue attachments or development.
