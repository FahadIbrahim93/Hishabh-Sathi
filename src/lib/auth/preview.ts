/**
 * Shared preview callback host patterns. These are public configuration values.
 *
 * OAuth credentials are NEVER embedded in source. Server-side federation
 * requires explicitly configured GROK_AUTH_CLIENT_ID and GROK_AUTH_CLIENT_SECRET;
 * without both, broker federation is disabled.
 */

/** The auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/** Callback host patterns allowed for approved preview deployments. */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
