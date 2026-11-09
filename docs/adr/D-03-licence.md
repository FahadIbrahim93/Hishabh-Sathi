# D-03: Licence model

**Status:** Proposed (decision pending)  
**Date:** 2026-11-10  
**Owner:** Fahad Ibrahim

## Context

The repo ships with no LICENSE and no description. SSOT open question Q7: proprietary vs source-available, due Week 1. Until a decision is made, `LICENSE` states all rights reserved and no copying or redistribution is permitted.

## Decision

No decision yet. Candidates:

- **Proprietary:** all rights reserved; commercial SaaS; simplest while solo-founded.
- **Source-available:** e.g. Business Source License — source visible, production SaaS use restricted, converts to open source after a defined period.

A Bangladeshi lawyer/accountant review (Q5) should inform the final choice before any customer-facing launch or pricing.

## Consequences

- `package.json` name is now `hishab-sathi`; repo description and topics set.
- No open-source licence is granted by this repository until D-03 is accepted.

## References

- SSOT §14 Q7, §15 D-03, §9 security and privacy baseline.
