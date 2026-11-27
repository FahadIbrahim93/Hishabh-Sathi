# Ledger verification · 21 November 2026

#20 passed the [post-merge CI gate](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44834750585). Issue #18 adds generated ledger, dues, consignment, rounding and Bangla parser checks. Historical money and reporting defects are tracked in #35–#39 and #41. Use actual hosted results for release decisions.

# Ledger property tests checkpoint - 20 November 2026

Issue #18. Branch `feat/ledger-property-tests`, stacked on `fix/ci-gate` (`9ed0c49`) so the new dev dependency sits under the audit gate recorded below.

## What changed

- `fast-check` 4.10.3 as a dev dependency. It has no transitive dependencies, so the audited tree stays at zero advisories.
- `src/lib/hishab/ledger.property.test.ts`, five properties:
  1. **Random walk.** A generated catalog (cost, price, pack size, opening cash and stock) plus a generated script of up to 14 operations. After *every* accepted posting: lines are integer paisa with one side per line and debits equal credits; every account and party balance moved by exactly its lines; stock moved by exactly the entry's moves and no product/location went negative; the trial balance holds in the app's normal-sign terms; history is append-only with unique ids; `audit()` is ok; replaying the entry is a no-op.
  2. **Reversal exactness.** Correcting an entry returns every account, party and product/location balance to the values immediately before that entry, and the original stays on the record.
  3. **Mirror and single correction.** The reversal swaps every debit and credit, negates every stock move, links the original, and refuses a second correction.
  4. **Refusal atomicity.** Fourteen invalid operations (over-sell, zero price, over-collection, payment above cash, over-consign, over-return, over-paid purchase, zero amounts, reversal of the opening balance, unknown mirror target) throw and leave the books unchanged.
  5. **Coverage guard.** A fixed script must exercise all eight operation kinds and both return modes, so a generator change cannot quietly stop testing a path.
- Requests that the engine re-validates and refuses in `apply` (stock gone, already corrected) count as atomic rejections, not failures: generators build feasible operations and the ledger keeps the final say.

## Findings (documented, not encoded — behaviour changes need Fahad)

1. `buildExpense` never checks available cash, while `buildPayment` refuses to spend more than the drawer holds. An expense can drive `cash` below zero.
2. A sold return refunds `value - min(due, value)` without checking cash, so a refund can take the drawer below zero when the customer had no due.
3. `apply` re-validates stock on a reversal but not cash or receivable. Reversing a sale whose due was already collected leaves that customer in credit (negative receivable). That may be a real customer credit, but the collection path refuses to produce the same state, so the two paths disagree.
4. `buildReversal` mirrors lines and stock but not `costUpdate`/`priceUpdate`, so reversing a purchase leaves the weighted-average cost at the post-purchase value.

The generators stay off paths 1 and 2, so the suite asserts guarantees instead of recording defects; nothing here locks the current behaviour in.

## Verification

- `npm run test:ci`: **122/122 tests in 15 files, 0 skipped, 3 browser specs executing**, gate line `test gate: ok - 122 passed, 0 failed, 0 skipped, 3 browser specs across 15 files (floor 110)`.
- `npm ci` from the updated lockfile 0 - `typecheck` 0 - `lint` 0 with the same 3 pre-existing warnings - `build` 0 - `npm run audit` 0.

## Still outstanding

- Issue #18's acceptance criteria could not be read: `gh` is unauthenticated and the unauthenticated GitHub API was rate-limited. Scope comes from `CONTRIBUTING.md` ("ledger changes require property tests") and the roadmap entry.
- The properties cover the engine. The device store and the UI keep their existing example-based and browser coverage.

# Hosted CI gate · 21 November 2026

#15 merged via #34. Main passed [dependency and PostgreSQL verification](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44834416515) and [CI](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44834416531) on 55feee0. Issue #20 now enforces the lockfile, dependency audit and all four browser scenarios. The audit script lives in the same change as its workflow invocation.

# Demo reset protection · 27 November 2026

Issue #49, reset scope. An existing shop must select a readable, valid backup matching the current books before replacing them with demo data. The existing IndexedDB transaction rejects a stale tab. A new device can still start with demo data from onboarding.

Local checks passed on the fix based on `da0b35d`. The strict suite ran 122 tests including five Chromium specs with zero skips. The reset spec downloaded a backup, tested cancellation and an aborted write, retried after reload and restored the exact original books. Typecheck, lint and build passed. Lint reported three existing warnings.

The #42 ledger test branch also passed locally, with 128 tests. Its application and test changes combined with this fix passed 132 tests, including five Chromium specs. Settle #35 before combining the financial behavior changes in #48. The remaining reporting defects stay tracked in #49.

# Dependency verification · 21 November 2026

Catalog issue #32 and PR #33 merged. [Post-merge main CI](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44833849170) passed for 863149d. Current issue #15 requires a new hosted audit and an isolated PostgreSQL auth schema check. Verify merge CI before proceeding to #20.

# Dependency audit checkpoint - 20 November 2026

Issue #15. `npm audit` on the lockfile before this branch: **15 advisories - 3 critical, 1 high, 9 moderate, 2 low**. After: **0 - `found 0 vulnerabilities`, exit 0**. Base commit `5445b6a` (stacked on the catalog durability draft), branch `fix/dependency-audit`.

## Critical and high advisories, and how each was closed

| Advisory | Package | Runtime or dev | Patched | Semver-compatible | Resolution |
| --- | --- | --- | --- | --- | --- |
| GHSA-965c-763c-88jm (critical, 9.1) OAuth state usable as magic link | `better-auth` | runtime, direct | 1.7.7+ | yes, minor within 1.x once the `~1.6.30` range is opened | upgraded to 1.7.27 |
| GHSA-r4xp-prcw-77qf (high, 7.4) OAuth Proxy sign-in as another user | `better-auth` | runtime, direct | 1.7.7+ | yes | upgraded to 1.7.27 |
| GHSA-q84f-53jg-9ppm (high, 8.1) device approval hides client/permissions | `better-auth` | runtime, direct | 1.7.0-rc.3+ | yes | upgraded to 1.7.27 |
| GHSA-5gmw-xhrv-c9v3 and GHSA-85c8-ppgw-ccpr (critical) tinypool prototype pollution to RCE | `tinypool` | dev, transitive through `vitest` | 2.1.2+ | no, `vitest` 3.2.7 pins tinypool 1.x | upgraded `vitest` 3.2.7 to 5.1.1, which ships tinypool 2.2.0 |
| GHSA-mrhx-c7xc-m3w5 (high, 7.5) zod memory exhaustion | `zod` | runtime, direct | 4.6.6+ | yes, already inside `^4.4.0` | floor raised to `^4.6.7`, resolved 4.6.7 |

Moderates and lows closed the same way: `@typescript-eslint/*` and `typescript-eslint` (dev, via `minimatch`) by upgrading to 8.73.0; `@vitest/mocker` path traversal (dev) and the two `@better-auth/*` adapter lows by the `vitest` and `better-auth` upgrades; `seroval` (runtime, transitive through `@tanstack/*`) updated 1.6.9 to 1.8.2 inside its existing `^1.6.7` range. No override was used for any advisory, and none is left reachable.

## API adaptation for better-auth 1.7

1.7 removed `genericOAuthClient` and the plugin endpoint `signInWithOAuth2`; generic OAuth providers are now registered as core social providers. `src/lib/auth/client.ts` calls `authClient.signIn.social({ provider })`, and `src/lib/auth/popup.server.ts` calls `auth.api.signInSocial({ body: { provider } })`. The server-side `genericOAuth({ config })` registration typechecked unchanged. No test was modified.

## Verification after the upgrades

`npm ci` 0 - `typecheck` 0 - `lint` 0 (the same 3 pre-existing `react-refresh` warnings, 0 errors) - `npm test` **110/110 in 13 files**, including the three IndexedDB browser specs executing against a real Chromium (9.6s) - `npm run build` 0 - `npm audit` 0, exit 0.

## Still outstanding

- `gh` is unauthenticated in this runner, so issue #15 has to be closed by a maintainer once this draft branch is reviewed; nothing was merged or deployed.
- Better Auth 1.7 may expect a newer auth schema than `migrations/auth/0001_auth.sql`. Sign-in is off in the shipped config and `DATABASE_URL` is unset locally, so no check here exercises it: regenerate that schema with the Better Auth CLI before enabling sign-in in a deployed environment.
- CI still installs with `npm install` instead of `npm ci` (#20) and relies on the runner image for Chrome and fonts; the browser specs skip silently if either is missing.

# Delivery integration · 21 November 2026

Work from Hishabh-Sathi. The earlier main checkpoint at 77c1218 passed [all 106 tests, typecheck, lint and build](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44747694855). The legacy VB-001 audit and VB-002 research remain inputs, VB-003 through VB-008 map to the active UI, ledger, offline and sync work, VB-009 is the field pilot and VB-010 is private-repo governance. Keep the long-term stack, hosting and licence decisions on #19.

Current work: #32 / #33. Hold catalog publication and success feedback until IndexedDB commits. Retain failed form input and verify stale-tab mode changes after a collection. Verify PR and merged-main CI separately. Follow with #15, #20, #18 and #16 in order.

# Integration checkpoint - 20 November 2026

**Post-merge verification of `main` after PR #29 and PR #31: COMPLETED.**

- Verified commit `77c12186e0fe4a9ab5bd637929871dc2e970231b` (the recorded `77c12186`), checked out in the worktree. Merge commits confirmed locally: PR #29 `32902a00e96f8159029a70bb9e30e8ac35e8b6f2`, PR #31 `c9c940de5e0dbab0dbd9411609aac6716cd366ed`.
- Commands taken from `package.json`, Node 26.13.0 / npm 11.20.0, fresh `npm ci` from the committed lockfile (exit 0):
  - `npm run typecheck` - exit 0.
  - `npm run lint` - exit 0, 3 pre-existing `react-refresh` warnings, 0 errors.
  - `npm test` - exit 0, 12 files, 106 tests, 0 skipped.
  - `npm run build` - exit 0; `db:migrate` skipped because `DATABASE_URL` is unset, so no database was touched.
- The three IndexedDB browser specs in `receipt.browser.test.ts` really ran against a real Chromium, not skipped. Bringing Chromium up on this runner needed two environment fixes that are runner gaps, not product defects: 117 Ubuntu library packages extracted privately under `/tmp` (no root, `sudo` blocked) and Bengali fonts (Lohit Bengali, Noto) with `FONTCONFIG_FILE`. Without fonts the Bangla text boxes had zero height and Playwright reported the failure message as hidden; the assertions were sound.
- Both PR claims hold on merged `main`: invalid backups never write, valid backups restore, one reversal per original, failed money writes never show a receipt, stale tabs are rejected for money, restore and reversal flows, books stay balanced and stock consistent.
- Two gaps found and fixed on the branch below: catalog/settings writes still claimed success on a failed write and bypassed the compare-and-swap.

**Next task:** manual device QA of backup/restore and reversal on a real phone browser, then `npm audit` triage (#15) and the ledger property tests required by CONTRIBUTING (#18). No production-readiness sign-off yet.

---

# Hishab Sathi engineering session

**20 November 2026 · Dhaka**

## Catalog write durability · 20 November 2026

**Finding.** Confirmation, reversal and restore waited for an IndexedDB commit, but catalog and settings writes did not. `persistDbBooks` returned `false` instead of rejecting and `persistSafe` swallowed it, so adding or editing a shop, a product, or switching the book mode showed the "saved on this phone" state before anything reached the device. Those same writes skipped the compare-and-swap, so a stale tab could replace newer books. `createBusiness` also finished onboarding before the first shop record was durable.

**Change.** Catalog and settings writes now use the same single-transaction compare-and-swap as money entries, compared against the last snapshot this tab knows is committed. A failed write reaches the caller, which shows the "not saved on this phone" state and a Bangla message. An absent device record matches an expected empty shop, so first-run onboarding still works. Onboarding now stays on the setup screen with the error when the first write fails.

**Verification.** Four new regressions in `catalog-durability.test.ts` (failed catalog write, working catalog write, stale-tab refusal, failed first shop write) failed on the pre-fix code and pass now. On the branch: `typecheck` exit 0, `lint` exit 0 with the same 3 warnings, `npm test` 110 tests in 13 files with the browser specs executing, `npm run build` exit 0. Browser-level coverage of these four paths was not added; the store contract is covered with a faked IndexedDB. No real-device pass yet.

**Next task awaiting confirmation.** Review this draft PR before merging, then the manual device QA above.


## Duplicate reversal fix · 20 November 2026

**Current task completed in draft.** [PR #31](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/31) addresses [issue #30](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/30). It builds on the backup restore changes in [PR #29](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/29). Both await review and merge.

**Finding.** Collecting ৳600 reduced Rahim’s dues from ৳8,000 to ৳7,400. The old engine accepted two reversals with different IDs for that collection, raising dues first to ৳8,000 and then to ৳8,600.

**Change.** The ledger now allows one linked correction per original. Repeated taps share the pending save. The form keeps the reason on failure and reports success after IndexedDB commits. Reopening a corrected entry displays its status. Manual restore detects duplicate reversals. Existing device history remains readable and any historical duplicate needs owner reconciliation.

**Verification.** Both new ledger and backup regression tests failed on the baseline. The implementation passed typecheck, lint, all 106 tests and the production build. Lint reported three existing warnings. Chrome aborted a reversal write, retried with the original reason, and rejected a second tab holding older books. Both tabs reloaded one linked correction and ৳8,000 due. A separate engine check reversed two distinct ৳600 payments once each. [Failing regression tests](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44745181224) · [Passing implementation](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44745505865)

**Next task awaiting confirmation.** Review the backup restore PR first, then the reversal PR against the updated base. Verify required checks and review findings before merging either financial change.

## Manual backup restore · 20 November 2026

**Current task** — The backup restore fix and its tests are in [draft PR #29](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/29), addressing [issue #28](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/28). The PR awaits review and merge.

**Completed.** Manual restore checks the v1 format, catalog and ledger records, references, per-entry journal balance and stock audit before writing. It rejects malformed files with a Bangla error. A valid restore uses one IndexedDB transaction to check the current device books and replace them. Success is shown only after commit. A storage failure leaves the original ledger available, and a stale tab must reopen the current books before restoring.

**Verified.** On the old implementation, 12 regression cases failed. The fixed implementation passed 102 tests, typecheck, lint and build. Lint reported three existing warnings. Chrome rejected a one-paisa discrepancy. After both that rejection and an aborted restore transaction, the full exported ledger still matched the original after reload (one ৳600 collection and ৳7,400 due). A valid earlier export restored the exact earlier ledger with ৳8,000 due. Stock-only transactions, archived parties and v1 data without optional fields also passed. [Failing baseline](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44742003162) · [Passing implementation](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44742487364)

**Next proposed task, awaiting confirmation.** Prevent a second reversal of the same original payment. Verify that retrying a reversal preserves one linked correction and adjusts dues only once after reload.

## Merge review · 20 November 2026

**Completed.** Reviewed and merged [#24](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/24) at [6d44c5e](https://github.com/FahadIbrahim93/Hishabh-Sathi/commit/6d44c5e08b6302cd0c862fee950e85497ec020c4), then [#26](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/26) at [d11f5ed](https://github.com/FahadIbrahim93/Hishabh-Sathi/commit/d11f5ed5924fd319a9f7eac12215614b10775d02). The branches had no unresolved review threads. The final merged file tree matched the reviewed startup PR. GitHub closed issues #23 and #25.

**Verification.** Typecheck, lint, tests and build passed on both merge commits. The integrated suite passed 85 tests, including the Chrome retry and reload checks. [Receipt merge CI](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44741139665) · [Startup merge CI](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44741219243)

**Follow-up selected for the next session.** Validate manual backup restore before it can replace existing books. Reject malformed or unbalanced entries, preserve the current ledger through reload, and verify that valid backups still restore.

## Startup recovery · 20 November 2026

**Review status** — Merged in [PR #26](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/26) after the receipt fix.

**Completed.** Startup now distinguishes a missing record from a failed read. If IndexedDB cannot read the books, the app shows “হিসাব খোলা যায়নি” and a retry button, keeps onboarding closed, and issues zero ledger writes. A successful read of existing books also issues zero writes. A genuinely new device still reaches onboarding. Concurrent startup calls share one read. Migration retains the legacy copy until the IndexedDB transaction commits.

**Verification.** The original code issued one ledger write after a failed read. Three regression cases failed against that baseline. The fixed implementation passed 85 tests, typecheck, lint and build. Lint reported three existing warnings. Chrome aborted a real IndexedDB read after a ৳600 collection, retried through the Bangla screen and recovered exactly one collection and ৳7,400 in dues. [Failing baseline](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44737663909) · [Passing implementation](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44737878033)

**Next proposed task, pending confirmation.** Validate manual backup restore before replacing the current books. A malformed or unbalanced backup should show a Bangla error and leave the original books intact after reload. A valid backup should restore its entries and balances.

## Receipt durability · 20 November 2026

**Review status** — Merged in [PR #24](https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/24), closing [issue #23](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/23).

**Completed.** The shared entry confirmation flow now waits for the IndexedDB transaction to commit before changing the balance, clearing the draft or showing a receipt. A failed write leaves the shop and amount available for retry and displays a Bangla error. Repeated taps on the same pending entry share one save. A confirmation based on older books is rejected if the device copy has changed.

**Verification.** The original code displayed a receipt while a write was pending. All three new store tests failed against that baseline, while the previous 75 tests passed. After the fix, the suite passed all 79 tests, including a Chrome check of the Bangla confirmation form with real IndexedDB. That check aborted a write, retried, reloaded the page and found exactly one ৳600 collection. Rahim's dues went from ৳8,000 to ৳7,400. Typecheck, lint and build passed. Lint reported three existing warnings. [Failing baseline](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44642403246) · [Passing implementation](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44643084484)

**Follow-up selected for the next session.** Protect startup recovery. If reading existing books fails, show a recoverable error and issue zero writes. Retry should load the original entries and balances. A genuinely empty database should still allow onboarding.

## Initial assessment · 20 November 2026

**Reviewed baseline** — [Hishabh-Sathi, main at 858efa2](https://github.com/FahadIbrahim93/Hishabh-Sathi/tree/858efa2feca63f8bb3e86ec6ae5db71901b37b01). Both repositories identify this as the active build. The earlier VoiceBooks AI prototype is outside the score. Findings come from reading source and tests. The 18 November status report records 75 passing tests, typecheck, lint and build. Those checks were not rerun in this session.

## Current quality — 5/10

Judged as software a distributor could trust with the only copy of a day's books. The core can distinguish a delivery from a sale and calculate what a shop owes. The rating stops at five because the app can tell the owner a payment was saved before it reaches durable storage. A correct balance on screen is insufficient if it disappears on reload.

## Top three strengths

1. **The accounting matches the business.** Consignment moves stock to a shop without creating revenue or a receivable. Collecting an old due reduces the balance without counting a second sale. Both cases have explicit tests. [Ledger tests](https://github.com/FahadIbrahim93/Hishabh-Sathi/blob/858efa2/src/lib/hishab/engine.test.ts)
2. **The Bangla entry flow gives the owner control.** Spoken input becomes a draft for review. The parser and tests distinguish “রেখে এসেছি” from “বিক্রি করেছি”, a difference that changes both stock and dues. [Parser](https://github.com/FahadIbrahim93/Hishabh-Sathi/blob/858efa2/src/lib/hishab/parser.ts)
3. **Corrections leave a trail.** The engine constructs a linked reversing entry that swaps debits and credits and undoes the stock movements. The original remains available when a shop disputes a balance. [Reversal builder](https://github.com/FahadIbrahim93/Hishabh-Sathi/blob/858efa2/src/lib/hishab/engine.ts#L292)

## Top three critical weaknesses

1. **A failed payment save can look successful.** The store opens the receipt and shows “হিসাব সেভ হয়েছে” before IndexedDB commits. The database helper resolves to false on failure, while the caller handles only a rejected promise. A collection can disappear after reload even though the owner saw a receipt. [Receipt path](https://github.com/FahadIbrahim93/Hishabh-Sathi/blob/858efa2/src/lib/hishab/store.ts#L224) · [Write helper](https://github.com/FahadIbrahim93/Hishabh-Sathi/blob/858efa2/src/lib/hishab/store.ts#L61)
2. **Recovery can overwrite good books.** Startup treats a failed database read as an empty result and writes the fallback back to the same key. If the next write succeeds, it can replace an existing ledger. Manual restore also accepts a backup after checking its outer shape, without validating individual entries or reconciling balances. Device-local storage makes these failures especially costly. [Read path](https://github.com/FahadIbrahim93/Hishabh-Sathi/blob/858efa2/src/lib/hishab/store.ts#L49) · [Restore path](https://github.com/FahadIbrahim93/Hishabh-Sathi/blob/858efa2/src/lib/hishab/store.ts#L368)
3. **The same payment can be reversed twice at the store layer.** Each reversal receives a fresh ID. The store checks the original entry's type, but does not check for an existing reversal of that original. The engine accepts distinct reversal IDs. If invoked twice for a ৳600 collection, the second reversal can add another ৳600 to dues while debits and credits still balance. This is a source-level finding. Reachability through normal screen navigation was not tested. [Store action](https://github.com/FahadIbrahim93/Hishabh-Sathi/blob/858efa2/src/lib/hishab/store.ts#L344) · [Engine checks](https://github.com/FahadIbrahim93/Hishabh-Sathi/blob/858efa2/src/lib/hishab/engine.ts#L222)

## What the product should ultimately do

Let a Bangladeshi distributor speak or tap what happened in Bangla, confirm it once, and keep a recoverable record of cash, stock held at each shop and outstanding dues, even through a network outage.

## Initial review tasks

| Task | Outcome |
| --- | --- |
| Identify the active implementation and its last recorded verification. | Reviewed main at 858efa2 and separated the 18 November test record from today's source inspection. |
| Trace one collection through confirmation, storage, recovery and reversal. | Ranked the three failure paths above by their impact on the owner's books. |
| Define the first fix narrowly enough to verify. | Start with receipt durability. On a failed write, keep the collection available for retry and show a Bangla failure message. Show a saved receipt only after a successful commit. After retry and reload, exactly one collection must remain. |

**Initial review boundary** — Documentation and source review only. The acceptance case above is specified for the next implementation session. No application code changed.
