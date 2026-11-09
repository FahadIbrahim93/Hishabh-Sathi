# Contributing to Hishab Sathi

1. Read `AGENTS.md` before changing code.
2. Create or select one GitHub issue from the backlog.
3. Branch from `main` using `feat/short-name`, `fix/short-name` or `docs/short-name`.
4. Keep changes scoped to the issue.
5. Add tests, especially for money, stock, authorization and idempotency. Ledger changes require property tests.
6. Update documentation and migrations where needed.
7. Run `npm run format`, `npm run lint`, `npm run typecheck` and `npm test`.
8. Open a pull request. Do not merge a financial behavior change without review and accounting acceptance evidence.

Never commit customer data, exports, secrets, real phone numbers or production database snapshots.
