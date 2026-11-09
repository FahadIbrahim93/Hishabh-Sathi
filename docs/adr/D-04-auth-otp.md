# D-04: Phone number + OTP auth via Better Auth

**Status:** Accepted  
**Date:** 2026-11-10  
**Owner:** Fahad Ibrahim

## Context

Better Auth and Kysely are already in the repo. The app is multi-user per business (owner, manager, cashier, accountant-readonly per SSOT §5.3) and multi-device in Phase 2, so phone + OTP authentication is required. SMS cost and delivery in Bangladesh (Q3) is an open operational question to be tested with local gateways before Phase 2 launch.

## Decision

Auth: phone number + OTP via Better Auth, session management, device list, remote sign-out. Roles enforced on the server, not only in the UI. No passwords.

## Consequences

- `migrations/auth/` (0001_auth.sql) is the opt-in auth schema; applied via PGLite locally and `db:migrate` on deploy.
- OTP rate limiting, short expiry and device binding must be designed in Phase 2 (SSOT §9).
- WhatsApp OTP fallback is the mitigation if SMS delivery/cost in BD proves poor (SSOT §13).

## References

- SSOT §5.1, §5.3 (membership roles), §9, §14 Q3, §15 D-04.
