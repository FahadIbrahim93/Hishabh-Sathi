/**
 * Service-worker registration for the installable app shell (#17).
 *
 * Deliberately defensive: the app must stay usable when registration fails
 * (private mode, an old browser, a blocked worker). Registration never touches
 * the device books — it only enables the cached shell and static assets.
 *
 * Production builds only: in `vite dev` a worker would cache the transformed
 * modules and fight HMR.
 */
export const SERVICE_WORKER_URL = "/sw.js";
export const SERVICE_WORKER_SCOPE = "/";

export type ServiceWorkerContainerLike = {
  register: (scriptURL: string, options?: { scope?: string }) => Promise<unknown> | unknown;
};

/**
 * Resolves `true` once the browser accepted the worker. Never rejects: a
 * failed registration is a degraded (online-only) session, not a broken app.
 */
export async function registerServiceWorker(
  container: ServiceWorkerContainerLike | undefined = typeof navigator === "undefined"
    ? undefined
    : (navigator.serviceWorker as ServiceWorkerContainerLike | undefined),
): Promise<boolean> {
  if (!container || typeof container.register !== "function") return false;
  try {
    await container.register(SERVICE_WORKER_URL, { scope: SERVICE_WORKER_SCOPE });
    return true;
  } catch (error) {
    console.warn("[hishab] service worker registration failed", error);
    return false;
  }
}
