# D-05 · One reversal per original ledger entry

20 November 2026 · Proposed in PR #31 for issue #30

A reversal undoes the entire original transaction. Applying two corrections to a single ৳600 collection overstates the shop’s dues by ৳600. Each correction has its own ID, so deduplicating by transaction ID alone misses a second attempt.

The ledger accepts one linked reversal per eligible original. Replaying the same correction ID remains idempotent. A different correction ID for that original is rejected. The device checks its current books and commits the correction in one IndexedDB transaction. Until that commits, the form keeps the reason and the balance reflects the original collection.

Manual restore rejects files containing duplicate corrections. Startup still opens existing books without altering history. Historical duplicates require owner reconciliation. To replace a mistaken payment, reverse it once and record the correct amount as a new payment.
