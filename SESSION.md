# Integration checkpoint — 20 November 2026

**Completed:** Reviewed and merged PR #29 (manual backup validation) and PR #31 (single reversal per original entry), in that order. Both were originally draft PRs. PR #31 was stacked on #29; GitHub recalculated mergeability after the first merge. Both merges used exact expected head SHAs.

- PR #29: https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/29 — merge commit `32902a00e96f8159029a70bb9e30e8ac35e8b6f2`.
- PR #31: https://github.com/FahadIbrahim93/Hishabh-Sathi/pull/31 — merge commit `c9c940de5e0dbab0dbd9411609aac6716cd366ed`.
- Review submissions and inline review threads: none on either PR.
- Pre-merge GitHub Actions evidence: PR #29 implementation run 44742487364 passed install, typecheck, lint, tests (reported 102), build. PR #31 implementation run 44745505865 passed the same steps (reported 106 tests). Both PR descriptions document browser failure/retry regression scenarios.
- **Fresh post-merge verification: NOT COMPLETED.** GitHub combined statuses and the available pull-request-filtered workflow-run query returned no checks for final main merge commit at inspection time. The current execution environment cannot clone GitHub (network DNS unavailable), so no independent `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, or `npm run build` was run against merged main. Do not represent pre-merge results as a final main CI pass.

**Next task:** Trigger or inspect a new GitHub Actions CI run for `c9c940d`, confirm install/typecheck/lint/all tests/build and browser IndexedDB backup/reversal regression coverage. If CI cannot run on merges, repair workflow trigger in a separate reviewed PR. Then perform manual device backup/restore QA and audit remaining storage writes and security vulnerabilities. No production-readiness sign-off yet.

---

# Hishab Sathi engineering session

**20 November 2026 · Dhaka**

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
