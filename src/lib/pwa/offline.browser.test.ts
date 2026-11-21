import { existsSync } from "node:fs";
import { chromium, type Page } from "playwright";
import { createServer } from "vite";
import { expect, it } from "vitest";

/**
 * Proves the real, shipped `public/sw.js` in a real Chromium: after one online
 * visit the app shell and its static module reopen with the network switched
 * off, while an API response is never served from a cache.
 *
 * The fixture is served at `/` so the worker's install-time precache and its
 * navigation fallback line up with production (a single-route app shell), and
 * the manifest, icons and offline page come from the repository's `public/`.
 */
const requireBrowser = process.env.REQUIRE_BROWSER === "1" || Boolean(process.env.CI);
const chrome = [process.env.CHROME_BIN, "/usr/bin/google-chrome", chromium.executablePath()].find(
  (path): path is string => Boolean(path && existsSync(path)),
);

const fixture = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <title>অফলাইন পরীক্ষা</title>
  </head>
  <body>
    <h1 id="heading">অ্যাপ শেল</h1>
    <p id="status">মডিউল লোড হয়নি</p>
    <script>
      window.apiCheck = () =>
        fetch("/api/private")
          .then((response) => response.json())
          .catch(() => null);
    </script>
    <!-- External, like the built app's hashed entry bundle. -->
    <script type="module" src="/fixture-app.js"></script>
    <script type="module">
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(() => navigator.serviceWorker.ready)
        .then((registration) => {
          window.swActive = Boolean(registration.active);
        })
        .catch((error) => {
          window.swError = String(error);
        });
    </script>
  </body>
</html>`;

const moduleSource = `document.getElementById("status").textContent = "মডিউল চলেছে";
export const entryLoaded = true;`;

async function withOfflinePage(
  run: (page: Page, context: { setOffline: (v: boolean) => Promise<void> }) => Promise<void>,
) {
  if (!chrome) {
    throw new Error(
      "Chromium is required for the offline PWA spec but no binary was found. " +
        "Run `npx playwright install chromium`.",
    );
  }
  const server = await createServer({
    configFile: false,
    server: { host: "127.0.0.1", port: 0 },
    plugins: [
      {
        name: "offline-pwa-fixture",
        configureServer(vite) {
          vite.middlewares.use((req, res, next) => {
            const path = (req.url ?? "").split("?")[0];
            if (path === "/") {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.end(fixture);
              return;
            }
            if (path === "/fixture-app.js") {
              res.setHeader("Content-Type", "text/javascript; charset=utf-8");
              res.end(moduleSource);
              return;
            }
            if (path === "/api/private") {
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ secret: "server-only" }));
              return;
            }
            next();
          });
        },
      },
    ],
  });
  try {
    await server.listen();
    const browser = await chromium.launch({ executablePath: chrome });
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(new URL("/", server.resolvedUrls!.local[0]).href);
      await run(page, {
        setOffline: async (offline: boolean) => {
          await context.setOffline(offline);
        },
      });
      expect(errors, "uncaught page errors").toEqual([]);
      await context.close();
    } finally {
      await browser.close();
    }
  } finally {
    await server.close();
  }
}

const browserTest = chrome || requireBrowser ? it : it.skip;
browserTest(
  "reopens the cached shell and static module offline without caching API data",
  () =>
    withOfflinePage(async (page, { setOffline }) => {
      await page.getByText("মডিউল চলেছে", { exact: true }).waitFor();
      await page.waitForFunction(
        () => (window as unknown as { swActive?: boolean }).swActive === true,
        undefined,
        { timeout: 15_000 },
      );
      await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, {
        timeout: 15_000,
      });

      // The server-only response is reachable while online...
      expect(await page.evaluate("window.apiCheck()")).toEqual({ secret: "server-only" });

      await setOffline(true);

      // ...and the app still opens from the cache with no network at all.
      await page.reload({ waitUntil: "load" });
      await page.getByText("মডিউল চলেছে", { exact: true }).waitFor();
      expect(await page.locator("#heading").textContent()).toBe("অ্যাপ শেল");

      // The module really executed from the cache, not just the HTML.
      expect(await page.evaluate("window.swActive")).toBe(true);

      const cachedPaths = await page.evaluate(async () => {
        const names = await caches.keys();
        const paths: string[] = [];
        for (const name of names) {
          const cache = await caches.open(name);
          for (const request of await cache.keys()) {
            paths.push(new URL(request.url).pathname);
          }
        }
        return paths.sort();
      });
      expect(cachedPaths).toContain("/");
      expect(cachedPaths).toContain("/fixture-app.js");
      expect(cachedPaths).toContain("/manifest.webmanifest");
      expect(cachedPaths).toContain("/icons/icon-512.png");
      expect(cachedPaths).not.toContain("/api/private");

      // API traffic fails offline instead of being answered from a stale cache.
      expect(await page.evaluate("window.apiCheck()")).toBeNull();

      await setOffline(false);
    }),
  120_000,
);
