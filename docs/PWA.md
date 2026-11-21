# Offline app shell (PWA)

Issue [#17](https://github.com/FahadIbrahim93/Hishabh-Sathi/issues/17). This document describes what the app caches, how updates and rollbacks work, and what an owner must know before relying on the phone as the only copy of the books.

## What ships

| File                                       | Purpose                                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `public/manifest.webmanifest`              | App identity: `id`/`start_url`/`scope` `/`, Bangla name and short name, `standalone`, theme `#0F6B4C`, 192/512 `any` and `maskable` icons. |
| `public/icons/*.png`                       | Four PNGs (192/512, normal and maskable with a safe-zone inset).                                                                           |
| `public/sw.js`                             | Versioned service worker: shell and static cache, network-first navigation, offline page.                                                  |
| `public/offline.html`                      | Self-contained Bangla fallback with inline CSS, no fonts or scripts, for a first visit that never completed.                               |
| `src/lib/pwa/register.ts`                  | Production-only registration (`/sw.js`, scope `/`). A refusal returns `false` and never breaks the app.                                    |
| `src/components/hishab/offline-status.tsx` | The honest status strip: “শুধু এই ফোনে সেভ · সার্ভারে সিঙ্ক হয় না” online, and the offline variant while the network is down.             |

`src/components/hishab/app.tsx` registers the worker after hydration. Registration is skipped in `vite dev` so the worker cannot cache transformed modules or fight HMR.

## Caching rules

Cached (three versioned caches, all prefixed `hishab-`):

- **shell** — `/` (the server-rendered document, refreshed on every successful navigation) and `/offline.html`.
- **static** — the manifest, favicon, the four icons, and every same-origin script/stylesheet/preload the shell document references (the build's hashed `/assets/*` files). The install step reads those URLs out of the HTML, so the first visit is covered even though the page is not yet controlled by the worker.
- **fonts** — `fonts.googleapis.com` and `fonts.gstatic.com`, so Bangla text keeps its typeface offline. Without them the device falls back to its own Bengali font.

Never cached:

- `/api/…`, `/auth/…`, `/_serverFn/…`, `/__app-env`, `/.well-known/…`.
- Any non-`GET` request.
- Requests with an `Authorization` header, `cache: "no-store"`, or `credentials: "include"` outside navigations and static files.
- Responses with `Cache-Control: no-store` or `private`, and any non-OK response.

Cache lookups pass `ignoreVary: true`. Servers answer `Vary: Origin` and `Vary: Accept-Encoding`, and the browser's module/preload request headers differ from the request that stored the file; without it the offline lookup misses and the module fails to load. These entries are public, immutable assets, so the stored copy is always correct.

Navigation is network-first: online, the fresh server document is stored as the shell; offline, the cached shell is served, then `/offline.html`, then a minimal 503 page if the app has never been cached.

## Updates and rollback

- Every cache name carries `VERSION` in `public/sw.js`. **Bump it whenever the shell, icons or caching rules change.**
- On activation the worker deletes every `hishab-` cache that is not part of the current version, then claims open tabs. It never force-activates a waiting worker mid-entry: a new version applies on the next load, or when a future prompt posts `{ type: "SKIP_WAITING" }`.
- **The worker never reads, writes or migrates IndexedDB.** A cache purge cannot touch the books. Stale tabs are handled by the device store's compare-and-swap, not by the worker.
- **Rollback:** deploy the previous build (previous `VERSION`), or ship a kill switch by replacing `public/sw.js` with:

  ```js
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        await Promise.all((await caches.keys()).map((name) => caches.delete(name)));
        await self.registration.unregister();
        for (const client of await self.clients.matchAll()) client.navigate(client.url);
      })(),
    );
  });
  ```

  The next visit removes the worker and every cache. Books stay on the device. Deploy a normal `sw.js` again to re-enable offline use.

## Owner guidance: device data is the only copy

There is no server sync yet. If the owner clears site data, resets the browser, uninstalls the browser or loses the phone, the books are gone.

- Take a backup from **আরও → ব্যাকআপ ও ফেরত আনা → ব্যাকআপ নিন** and keep the JSON file somewhere else (another phone, a computer, a messaging app with cloud backup).
- Installing the app to the home screen does not create a second copy: it is the same on-device storage.
- Restore works offline and validates the file before replacing anything.
- Do not clear site data to “free up space” while the app is in use.

## Verification status

Automated:

- `src/lib/pwa/service-worker.test.ts` runs the shipped `public/sw.js` in a VM with fake caches/fetch and the real `public/` files: shell precache, install refusal on a missing asset, version purge and claim, offline shell/offline-page/503 fallbacks, exclusion of auth/API/server-function/non-GET/credentialled traffic, static and font caching, `Vary` handling, and the `SKIP_WAITING` message.
- `src/lib/pwa/manifest.test.ts` validates the manifest fields, the four icon slots, real PNG signatures and IHDR sizes, and that `offline.html` has no external or script dependencies.
- `src/lib/pwa/register.test.ts` covers registration scope, refusal and missing support.
- `src/lib/pwa/offline.browser.test.ts` runs real Chromium (non-skipping under `CI`/`REQUIRE_BROWSER`): load once, confirm the worker controls the page, close the server, reload, and assert the shell and its module execute from cache while `/api/private` is never cached and fails offline.

Not verified, and therefore not claimed:

- **Installing on a real Android device** and its install prompt, maskable-icon rendering, safe-area, touch targets, font rendering, permissions and behaviour after OS-level storage pressure.
- Any behaviour on a deployed origin. Nothing is deployed yet, and the Vercel build has not been exercised with the worker.
