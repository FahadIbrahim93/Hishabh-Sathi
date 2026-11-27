# Engineering audit and release criteria

27 November 2026. Scope: active TypeScript distributor MVP at [da0b35d](https://github.com/FahadIbrahim93/Hishabh-Sathi/tree/da0b35dad9bdab2efbd61778ac96ae3ae21e6c1a). The older Python prototype is research input. [Live task board](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/58).

## Evidence and limits

Read SESSION, AGENTS, README, status, roadmap, package scripts, CI workflow, ledger, store, backup validation, parser, voice and screen code. Compared open issues and PRs with [hosted main CI](https://github.com/FahadIbrahim93/Hishabh-Sathi/actions/runs/44834750585). The published run passed install, audit, typecheck, lint, strict tests and build. No fresh full-suite run, phone test, deployment, merchant interview or penetration test was performed in this audit.

Independently executed the unmodified engine, seed, money and type modules with Node 24.22.3. Reproduce from the baseline repository root:

```js
// Run with node --input-type=module on standard input.
import { makeSeed } from './src/lib/hishab/seed.ts';
import { apply, buildExpense, expenseBetween, profitBetween, balance, audit } from './src/lib/hishab/engine.ts';
import { takaToPaisa, normalizeText, scanAmounts } from './src/lib/hishab/money.ts';
const empty = { ...makeSeed(), entries: [] };
const books = apply(empty, buildExpense(empty, { id: 'rent', at: 100, amountPaisa: 50000, label: 'rent' }));
console.log(expenseBetween(books, 0, 200), profitBetween(books, 0, 200), balance(books, 'cash'), audit(books).ok);
console.log(takaToPaisa(15.50), scanAmounts(normalizeText('দেড় হাজার')));
```

Observed expense 0, profit 0, cash −50000 paisa, health true. A posted rent expense of ৳500 should contribute ৳500 expense and −৳500 profit. Observed 1600 paisa for ৳15.50 (expected 1550) and 1000 for দেড় হাজার (expected 1500). The cash funding rule awaits #35. Source also shows archived parties skipped in duesAging and expenseBetween summing credits. PR and issue measurements elsewhere in this report are attributed repository evidence.

## Scorecard

Scores are engineering judgments of demonstrated maturity. 1–2 means planned or unproven, 3–4 means material gaps, 5–6 means implemented with partial verification, 7 means substantial automated evidence, 8 means verified in the scoped pilot, 9 means repeatable independent field evidence, 10 requires sustained operational evidence. Equal-weight baseline = 57/13 = 4.4/10. A release decision always requires the gates below.

| Aspect | /10 | Basis | Evidence to earn a higher score |
|---|---:|---|---|
| Product scope | 7 | Sales, consignment and collections model the distributor route. #19 and #45 lack signed field outcomes. | Owner signs a route fixture and daily close. |
| Ledger and reports | 3 | Wrong rent, profit and paisa reproduced. #35–39, #41, #49, #52 and #54 affect actual balances or their interpretation. | Zero unexplained variance across cash, dues, inventory, cost and profit, including partial returns and reversals. |
| Local persistence and recovery | 6 | Receipts, startup, catalog, backup and single payment reversal have merged browser evidence. Demo reset remains destructive (#49). | Failed reset, stale tab, interrupted writes and second-phone restore preserve every confirmed posting. |
| Architecture and maintainability | 6 | Typed journal and separate parser/store are useful boundaries. #53 documents payment validation coupled to display text. Store and backup share health assumptions (#54). | Check legacy data and alternate spellings. Separate display wording from posting rules and distinguish recoverable warnings from invalid backups. |
| Bangla entry and voice | 4 | Confirmation exists. Parser reproduced a ৳500 understatement. Voice relies on browser recognition. No field benchmark (#44). | Test amount, party, intent and units with consented speakers and manual fallback. Publish denominator and failures. |
| UX and accessibility | 4 | Bangla forms and retry states exist. Real Android accessibility and task completion lack sign-off (#43). | Test TalkBack, large text, tap targets, Bangla errors, keyboard and manual entry on the pilot phone. |
| Performance and scale | 4 | Dues aging scans entries per party. #48 has branch desktop timings. Production phone capacity is unknown. | Record median and p95 for open, save, report and reload on a named low-cost phone with a 20,000-entry fixture. Agree limits before measurement. |
| Offline and portability | 3 | IndexedDB persists books. Install and disconnected cold start remain open (#17). | Install, close, disconnect, reopen, transact, reload and export on real Android. |
| Automated quality | 7 | Hosted main CI passed lockfile install, audit, browser checks and build. #48 records five separate script-suite failures and a conflict with #42. | Run both suites on clean checkout, require browser execution, replay failing seeds on combined main and link run. |
| Security and privacy | 4 | Read-only CI and a dependency audit exist. #48 reports an embedded auth fallback. Tenant isolation, retention and release controls await verification (#21/#46). | Remove fallback, determine rotation need with owner, verify scoped access, private test data, recovery and release configuration. |
| Deployment and operations | 2 | Build passes. #46 has no verified release or rollback drill. | Approved isolated preview with exact SHA, smoke tests, rollback, named support owner and timed recovery drill. |
| Documentation and collaboration | 5 | AGENTS.md defines ownership and reviews. ROADMAP still lists merged tasks. PR #48 spans unrelated concerns. | Reconcile #47, SESSION and live board. Sample closed cards for reviewer, test evidence and post-merge verification. |
| Merchant and commercial validation | 2 | #45 defines a pilot. Interviews, retained users, payments and service cost lack verified outcomes. | Run the consented pilot, then measure independent usage, retention, real payments and support cost. |

## Delivery sequence and decision rights

Use [board #58](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/58) for owners, dependencies, issue numbers and handoff. Start with the reset slice of #49. Parallel work can review test-only #42 and the Bangla regression in #51. Fahad and the route owner settle funding, credit, inventory and debt allocation with worked examples before changes to those rules. Then reconcile the integrated ledger against an independently calculated paper route. Preserve historic exports and record proposed adjustments explicitly. Complete #17 and #43 before routing real transactions through the app. #21 is a separate expansion after local sign-off.

**8/10 target — supervised local distributor MVP.** Reviewer signs the release SHA and the scorecard row by row. Require all in-scope technical dimensions at 8, zero outstanding data-loss or wrong-money defects, green combined and post-merge suites, a historical backup restored on another phone, and a seven-operating-day trial with one distributor and five shops. Each day match paper cash, dues, warehouse and consigned stock. Require zero unexplained variance, duplicate postings or silent loss. Record failures and reruns. Benchmark voice separately before including it in the verified scope. Disclose any deferred dimensions and retain their actual scores in the overall average.

**9/10 target — repeatable product.** Meet the 8 gates, then run four weeks across five independent businesses. Proposed thresholds from the delivery plan: ≥90% unaided core-task completion, ≥95% sale/consignment comprehension, median routine sale under 30 seconds, ≥95% correct confirmed voice amounts if offered, ≥3/5 weekly active at week four, ≥2 real paying businesses and positive contribution after support. Publish numerators, denominators and device mix, repeat recovery and rollback on the release candidate, and verify isolation if sync ships. Small-sample outcomes support this cohort only. Claim an overall 8 or 9 only when the updated mean reaches the threshold and mandatory gates pass.

**Verification record.** For each row capture target, method, expected/actual, build SHA, environment, sample size, artifact, reviewer, date and remaining exceptions. Reopen on regression. Review settings against [GitHub protected branch guidance](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches). A passing workflow alone does not establish that protection is enforced. No repository settings changed.
