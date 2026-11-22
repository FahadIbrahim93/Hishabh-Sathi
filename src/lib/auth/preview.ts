/**
 * Live-preview auth constants (server-only).
 *
 * The broker's shared preview client id and secret are NOT stored here. Set
 * GROK_AUTH_CLIENT_ID / GROK_AUTH_CLIENT_SECRET in the environment (sandbox or
 * deploy); without them federated sign-in stays off (see `server.ts`).
 */
/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/**
 * Host patterns whose callbacks the preview client accepts. Better Auth derives
 * the live preview's real origin from the request host and validates it against
 * this list (wildcard-matched), so the OAuth `redirect_uri` becomes the concrete
 * `https://<preview-host>/api/auth/oauth2/callback/...` the broker allows.
 */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
