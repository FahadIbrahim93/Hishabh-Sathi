/*
 * Hishab Sathi service worker — issue #17.
 *
 * Scope: the installable app shell and immutable static assets only. Books live
 * in IndexedDB and are never read, written or migrated here, so a service
 * worker update can never touch money. Authenticated, mutable and server
 * function traffic is deliberately left on the network.
 *
 * To ship a change, edit the files and bump VERSION. Activation deletes every
 * `hishab-` cache that is not in the current version, so a bad release is
 * rolled back by deploying a build with the previous VERSION (or the kill
 * switch in docs/PWA.md) — never by touching the device's books.
 */
const VERSION = "1";
const CACHE_PREFIX = "hishab-";
const SHELL_CACHE = `${CACHE_PREFIX}shell-v${VERSION}`;
const STATIC_CACHE = `${CACHE_PREFIX}static-v${VERSION}`;
const FONT_CACHE = `${CACHE_PREFIX}fonts-v${VERSION}`;
const CURRENT_CACHES = new Set([SHELL_CACHE, STATIC_CACHE, FONT_CACHE]);

const SHELL_URL = "/";
const OFFLINE_URL = "/offline.html";

/** Everything needed to reopen the app with no network at all. */
const SHELL_ASSETS = [
  SHELL_URL,
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-192.png",
  "/icons/maskable-512.png",
];

/** Same-origin URLs the shell document itself loads (entry JS, CSS, preloads). */
const DOCUMENT_ASSET = /(?:src|href)="(\/[^"?#]+)"/g;

/**
 * Server data that must never be cached: Better Auth, TanStack server
 * functions, the dev-only env endpoint and any other API surface.
 */
const NETWORK_ONLY_PREFIXES = ["/api/", "/auth/", "/_serverFn", "/__app-env", "/.well-known/"];

const FONT_ORIGINS = new Set(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]);

const STATIC_PREFIXES = ["/assets/", "/icons/"];
const STATIC_FILES = new Set(["/favicon.svg", "/manifest.webmanifest", "/offline.html", "/og.jpg"]);
const STATIC_EXTENSIONS = /\.(?:js|mjs|css|woff2?|ttf|otf|png|jpe?g|webp|avif|svg|ico)$/i;

/**
 * Cache lookups ignore `Vary`. A page request (module script, preload, font)
 * carries different `Sec-Fetch-*`/`Origin` headers than the request that stored
 * the response, and servers legitimately answer `Vary: Origin` or
 * `Vary: Accept-Encoding`. These entries are public, immutable assets, so the
 * stored response is the right one for every request.
 */
const MATCH_OPTIONS = { ignoreVary: true };

function isStaticPath(pathname) {
  return (
    STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    STATIC_FILES.has(pathname) ||
    STATIC_EXTENSIONS.test(pathname)
  );
}

function isPrivateRequest(request, url) {
  if (request.method !== "GET") return true;
  if (url.origin !== self.location.origin) return false;
  if (NETWORK_ONLY_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return true;
  if (request.headers && request.headers.has("authorization")) return true;
  if (request.cache === "no-store") return true;
  // Credentialled, non-static traffic belongs to a signed-in session: never
  // cache it. Navigations and same-origin static files are the exception —
  // browsers mark both as credentialed, and both are the public app shell.
  if (
    request.credentials === "include" &&
    request.mode !== "navigate" &&
    !isStaticPath(url.pathname)
  ) {
    return true;
  }
  return false;
}

function isCacheable(response, allowOpaque = false) {
  if (allowOpaque && response.type === "opaque") return true;
  if (!response.ok) return false;
  const cacheControl = response.headers.get("cache-control") || "";
  return !/no-store|private/i.test(cacheControl);
}

async function fetchInto(cache, asset, required) {
  try {
    const response = await fetch(new Request(asset, { cache: "reload" }));
    if (!response.ok) return false;
    await cache.put(asset, response);
    return true;
  } catch {
    if (required) throw new Error(`hishab-sw: could not precache ${asset}`);
    return false;
  }
}

/**
 * The first visit is not under worker control, so nothing the page loads before
 * activation reaches the fetch handler. Precache the shell document and the
 * static files it names, so the first offline reopen already works.
 */
async function precacheShellDocument(shellCache, staticCache) {
  const document = await fetch(new Request(SHELL_URL, { cache: "reload" }));
  if (!document.ok) throw new Error("hishab-sw: app shell document is unavailable");
  await shellCache.put(SHELL_URL, document.clone());

  const assets = new Set();
  for (const match of (await document.text()).matchAll(DOCUMENT_ASSET)) {
    const asset = match[1];
    // The fixed shell list is already cached; only the build's own files remain.
    if (isStaticPath(asset) && !SHELL_ASSETS.includes(asset)) assets.add(asset);
  }
  // Optional preloads may legitimately 404; the shell itself already succeeded.
  await Promise.all([...assets].map((asset) => fetchInto(staticCache, asset, false)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Each asset is stored on its own so a single missing file leaves the
      // previous worker in control instead of half-populating a new shell.
      const results = await Promise.all(
        SHELL_ASSETS.filter((asset) => asset !== SHELL_URL).map((asset) =>
          fetchInto(cache, asset, false),
        ),
      );
      if (results.includes(false)) {
        throw new Error("hishab-sw: app shell could not be fully precached");
      }
      await precacheShellDocument(cache, await caches.open(STATIC_CACHE));
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && !CURRENT_CACHES.has(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;
  // A future update prompt can activate a waiting worker at a safe moment.
  if (data.type === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
  }
});

async function cacheFirst(request, cacheName, allowOpaque = false) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request, MATCH_OPTIONS);
  if (hit) return hit;
  const response = await fetch(request);
  if (isCacheable(response, allowOpaque)) {
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    const url = new URL(request.url);
    if (url.origin === self.location.origin && response.ok && isCacheable(response)) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(SHELL_URL, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const shell = await cache.match(SHELL_URL, MATCH_OPTIONS);
    if (shell) return shell;
    const offline = await cache.match(OFFLINE_URL, MATCH_OPTIONS);
    if (offline) return offline;
    return new Response(
      '<!doctype html><html lang="bn"><meta charset="utf-8"><title>অফলাইন</title><body><h1>অফলাইন</h1><p>এই ফোনে হিসাব রাখা আছে, কিন্তু অ্যাপটি এখনও ডাউনলোড হয়নি। ইন্টারনেট দিয়ে একবার খুলুন।</p></body></html>',
      { status: 503, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (isPrivateRequest(request, url)) return;

  if (FONT_ORIGINS.has(url.origin)) {
    // Google Fonts styles and woff2 files are immutable enough for cache-first;
    // without them Bangla text falls back to whatever the device has.
    event.respondWith(cacheFirst(request, FONT_CACHE, true));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.origin === self.location.origin && isStaticPath(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  }
  // Any other same-origin GET stays on the network: it is server data.
});
