# Federated authentication: server-only configuration

**Security posture (28 November 2026):** Broker federation is **off** when either required credential is missing or empty. No credential is committed to source, inserted in the browser bundle, or substituted as a preview fallback.

## Server environment variables

Set these securely in the server's private environment when federated auth is explicitly authorized:

- `GROK_AUTH_CLIENT_ID` — approved client identifier
- `GROK_AUTH_CLIENT_SECRET` — approved **secret value**, private server-side only
- `GROK_AUTH_ISSUER` — broker issuer if the allowed default is not appropriate
- `BETTER_AUTH_SECRET` — production Better Auth signing secret
- `BETTER_AUTH_URL` — deployment URL
- `DATABASE_URL` — production PostgreSQL connection string
- `VITE_AUTH_ENABLED=false` — explicitly disables sign-in; no broker authentication is enabled regardless of supplied credentials

Do not create working credentials for development examples, test fixtures or public CI. Preview OAuth must also use explicitly provisioned server credentials, not shared public source constants.

## Credential exposure and revocation

An old preview credential was present in public Git history. **Removing it from the current tree does not revoke it.** Owner action in [#66](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/66) must verify rotation/revocation in the upstream broker, review its redirect allowlist and access logs, and test newly configured login before any production merchant use. Never paste replacement secrets into GitHub issues or screenshots.

## Acceptance and operations

Verify configuration with empty, one-sided and full private credentials. Run the auth integration suite, CI, deployment smoke tests and an approved broker sign-in test before marking federated auth ready. A passed PostgreSQL schema test does **not** prove that the upstream credential is rotated or that a production provider is connected.
