# D-02: Allow concurrent oversell offline; flag as stock conflict

**Status:** Accepted  
**Date:** 2026-11-10  
**Owner:** Fahad Ibrahim

## Context

Two offline phones can both sell the last case of stock. The current UI falsely claims two phones cannot oversell stock while there is no sync. Blocking a sale because another device might have sold the last item breaks offline operation; silently dropping one sale loses the owner's money.

## Decision

Allow concurrent oversell offline. On sync, if warehouse stock goes negative, the app raises a visible "stock conflict" task for the owner to resolve with an adjustment entry. Neither sale is silently dropped. Remove the current UI claim until this ships.

## Consequences

- Offline sales never fail for stock reasons.
- Negative stock is a sync-time task, not a silent failure or a dropped transaction.
- The engine still enforces debit = credit and integer balances per entry (D-05).

## References

- SSOT §5.2 concurrency rule, §5.3 `entry` model, §13 risks ("Sync bugs corrupt books").
