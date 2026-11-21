import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

/**
 * Runs the exact file the browser will fetch (`public/sw.js`) in a VM with the
 * service-worker globals stubbed, so the tests cannot drift from the shipped
 * worker. Precache fetches read from `public/`, which means a typo in an asset
 * path fails here instead of breaking install on a real phone.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const PUBLIC = join(ROOT, "public");
const SOURCE = readFileSync(join(PUBLIC, "sw.js"), "utf8");
const ORIGIN = "https://hishab.test";

type RequestLike = {
  url: string;
  method?: string;
  mode?: string;
  credentials?: string;
  cache?: string;
  headers?: Headers;
};

function request(path: string, init: Partial<RequestLike> = {}): RequestLike {
  return {
    url: new URL(path, ORIGIN).href,
    method: init.method ?? "GET",
    mode: init.mode ?? "cors",
    credentials: init.credentials ?? "same-origin",
    cache: init.cache ?? "default",
    headers: init.headers ?? new Headers(),
  };
}

/** Browser `Request` resolves relative URLs against the worker; Node does not. */
class ScopedRequest extends Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(typeof input === "string" ? new URL(input, `${ORIGIN}/`).href : input, init);
  }
}

function keyOf(key: string | { url?: string }): string {
  const raw = typeof key === "string" ? key : (key.url ?? "");
  return new URL(raw, `${ORIGIN}/`).href;
}

class FakeCache {
  readonly entries = new Map<string, Response>();

  async put(key: string | { url?: string; headers?: Headers }, value: Response): Promise<void> {
    this.entries.set(keyOf(key), value);
    this.rememberRequest(key);
  }

  /** Mirrors the Cache API's `Vary` semantics unless `ignoreVary` is set. */
  async match(
    key: string | { url?: string; headers?: Headers },
    options?: { ignoreVary?: boolean },
  ): Promise<Response | undefined> {
    const response = this.entries.get(keyOf(key));
    if (!response || options?.ignoreVary) return response;
    const vary = response.headers.get("vary");
    if (!vary) return response;
    if (vary.trim() === "*") return undefined;
    const lookup = typeof key === "string" ? new Headers() : (key.headers ?? new Headers());
    const stored = this.storedRequests.get(keyOf(key)) ?? new Headers();
    for (const name of vary.split(",").map((value) => value.trim().toLowerCase())) {
      if ((lookup.get(name) ?? null) !== (stored.get(name) ?? null)) return undefined;
    }
    return response;
  }

  private readonly storedRequests = new Map<string, Headers>();

  rememberRequest(key: string | { url?: string; headers?: Headers }) {
    this.storedRequests.set(
      keyOf(key),
      typeof key === "string" ? new Headers() : (key.headers ?? new Headers()),
    );
  }

  async keys(): Promise<Request[]> {
    return [...this.entries.keys()].map((url) => new Request(url));
  }
}

class FakeCaches {
  private readonly stores = new Map<string, FakeCache>();

  async open(name: string): Promise<FakeCache> {
    let store = this.stores.get(name);
    if (!store) {
      store = new FakeCache();
      this.stores.set(name, store);
    }
    return store;
  }

  async keys(): Promise<string[]> {
    return [...this.stores.keys()];
  }

  async delete(name: string): Promise<boolean> {
    return this.stores.delete(name);
  }

  async has(name: string): Promise<boolean> {
    return this.stores.has(name);
  }

  names(): string[] {
    return [...this.stores.keys()].sort();
  }
}

type FetchImpl = (target: RequestLike) => Promise<Response>;

/** Serves the repository's real public/ files, like the deployed app would. */
const servePublic: FetchImpl = async (target) => {
  const pathname = new URL(target.url).pathname;
  if (pathname === "/") {
    return new Response("<!doctype html><html><body>app shell</body></html>", {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  const file = join(PUBLIC, pathname);
  if (!file.startsWith(PUBLIC) || !existsSync(file)) {
    return new Response("missing", { status: 404 });
  }
  return new Response(readFileSync(file), {
    status: 200,
    headers: {
      "content-type": pathname.endsWith(".js") ? "text/javascript" : "application/octet-stream",
    },
  });
};

const offline: FetchImpl = async () => {
  throw new TypeError("Failed to fetch");
};

type Dispatched = {
  response?: Response;
  responded: boolean;
};

function createWorker(fetchImpl: FetchImpl) {
  const listeners = new Map<string, ((event: unknown) => void)[]>();
  const cacheStorage = new FakeCaches();
  const claim = vi.fn(async () => {});
  const skipWaiting = vi.fn(async () => {});
  const self = {
    location: new URL(`${ORIGIN}/sw.js`),
    addEventListener(type: string, handler: (event: unknown) => void) {
      const list = listeners.get(type) ?? [];
      list.push(handler);
      listeners.set(type, list);
    },
    clients: { claim },
    skipWaiting,
  };

  vm.runInContext(
    SOURCE,
    vm.createContext({
      self,
      caches: cacheStorage,
      fetch: fetchImpl,
      Request: ScopedRequest,
      Response,
      Headers,
      URL,
      console,
    }),
    { filename: "public/sw.js" },
  );

  async function dispatch(type: string, event: Record<string, unknown> = {}): Promise<Dispatched> {
    const waits: Promise<unknown>[] = [];
    let responsePromise: Promise<Response> | undefined;
    const dispatched = {
      ...event,
      waitUntil(promise: Promise<unknown>) {
        waits.push(promise);
      },
      respondWith(promise: Promise<Response>) {
        responsePromise = promise;
      },
    };
    for (const handler of listeners.get(type) ?? []) handler(dispatched);
    await Promise.all(waits);
    return {
      response: responsePromise ? await responsePromise : undefined,
      responded: Boolean(responsePromise),
    };
  }

  return { dispatch, cacheStorage, claim, skipWaiting };
}

async function installed(fetchImpl: FetchImpl = servePublic) {
  const worker = createWorker(fetchImpl);
  await worker.dispatch("install");
  return worker;
}

describe("shipped service worker", () => {
  it("never touches the device books", () => {
    expect(SOURCE).not.toMatch(/indexedDB\./);
    expect(SOURCE).not.toMatch(/localStorage\./);
  });

  it("precaches the shell, offline page, manifest and icons from real files", async () => {
    const worker = await installed();
    const shell = await worker.cacheStorage.open("hishab-shell-v1");
    const urls = [...shell.entries.keys()].map((url) => new URL(url).pathname).sort();
    expect(urls).toEqual([
      "/",
      "/favicon.svg",
      "/icons/icon-192.png",
      "/icons/icon-512.png",
      "/icons/maskable-192.png",
      "/icons/maskable-512.png",
      "/manifest.webmanifest",
      "/offline.html",
    ]);
    expect(worker.cacheStorage.names()).toEqual(["hishab-shell-v1", "hishab-static-v1"]);
  });

  it("precaches the entry script and styles the shell document loads", async () => {
    const worker = createWorker(async (target) => {
      const pathname = new URL(target.url).pathname;
      if (pathname === "/") {
        return new Response(
          `<html><head><link rel="stylesheet" href="/assets/app-abc.css">` +
            `<link rel="manifest" href="/manifest.webmanifest">` +
            `<link rel="preload" as="fetch" href="/api/private"></head>` +
            `<body><script type="module" src="/assets/app-abc.js"></script></body></html>`,
          { status: 200, headers: { "content-type": "text/html" } },
        );
      }
      if (pathname === "/assets/app-abc.js") return new Response("console.log('app')");
      if (pathname === "/assets/app-abc.css") return new Response("body{}");
      return servePublic(target);
    });

    await worker.dispatch("install");

    const staticCache = await worker.cacheStorage.open("hishab-static-v1");
    const urls = [...staticCache.entries.keys()].map((url) => new URL(url).pathname).sort();
    expect(urls).toEqual(["/assets/app-abc.css", "/assets/app-abc.js"]);
  });

  it("serves an asset whose Vary header no longer matches the browser request", async () => {
    // Servers answer `Vary: Origin`; the module request that follows carries
    // different headers than the fetch that stored the response. Without
    // ignoreVary the lookup misses and the offline module fails to load.
    let online = true;
    const worker = createWorker(async () => {
      if (!online) throw new TypeError("Failed to fetch");
      return new Response("console.log('app')", {
        status: 200,
        headers: { "content-type": "text/javascript", vary: "Origin" },
      });
    });

    await worker.dispatch("fetch", {
      request: request("/assets/app-vary.js", {
        headers: new Headers({ origin: "https://hishab.test" }),
      }),
    });
    online = false;

    const moduleRequest = request("/assets/app-vary.js");
    const cache = await worker.cacheStorage.open("hishab-static-v1");
    expect(await cache.match(moduleRequest)).toBeUndefined();

    const result = await worker.dispatch("fetch", { request: moduleRequest });
    expect(result.responded).toBe(true);
    expect(await result.response!.text()).toContain("console.log");
  });

  it("refuses to install a half-cached shell", async () => {
    const worker = createWorker(async (target) =>
      new URL(target.url).pathname === "/offline.html"
        ? new Response("missing", { status: 404 })
        : servePublic(target),
    );
    await expect(worker.dispatch("install")).rejects.toThrow(/precached/);
  });

  it("activation removes older versions and claims open tabs", async () => {
    const worker = createWorker(servePublic);
    await worker.cacheStorage.open("hishab-shell-v0");
    await worker.cacheStorage.open("hishab-static-v0");
    await worker.cacheStorage.open("unrelated-app-cache");

    await worker.dispatch("activate");

    expect(worker.cacheStorage.names()).toEqual(["unrelated-app-cache"]);
    expect(worker.claim).toHaveBeenCalledTimes(1);
  });

  it("reopens the cached shell while offline", async () => {
    const offlineWorker = createWorker(offline);
    await offlineWorker.cacheStorage.open("hishab-shell-v1").then(async (cache) => {
      await cache.put("/", new Response("<html>অফলাইন শেল</html>"));
    });

    // Browsers send navigations with credentials: "include".
    const result = await offlineWorker.dispatch("fetch", {
      request: request("/", { mode: "navigate", credentials: "include" }),
    });
    expect(result.responded).toBe(true);
    expect(await result.response!.text()).toContain("অফলাইন শেল");
    expect(result.response!.status).toBe(200);
  });

  it("falls back to the offline page when the shell is missing", async () => {
    const worker = createWorker(offline);
    const cache = await worker.cacheStorage.open("hishab-shell-v1");
    await cache.put("/offline.html", new Response("<html>অফলাইন পাতা</html>"));

    const result = await worker.dispatch("fetch", {
      request: request("/dues", { mode: "navigate", credentials: "include" }),
    });
    expect(await result.response!.text()).toContain("অফলাইন পাতা");
  });

  it("answers 503 in Bangla when nothing has been cached yet", async () => {
    const worker = createWorker(offline);
    const result = await worker.dispatch("fetch", {
      request: request("/", { mode: "navigate", credentials: "include" }),
    });
    expect(result.response!.status).toBe(503);
    expect(await result.response!.text()).toContain("অফলাইন");
  });

  it("never intercepts auth, API, server functions or non-GET traffic", async () => {
    const worker = await installed();
    const cases: RequestLike[] = [
      request("/api/auth/session"),
      request("/auth/popup?providerId=google"),
      request("/_serverFn/abc123"),
      request("/__app-env"),
      request("/api/books", { method: "POST" }),
      // A credentialled page-like path is session data, not an asset.
      request("/legacy-books", { credentials: "include" }),
      request("/assets/app.js", {
        headers: new Headers({ authorization: "Bearer secret" }),
      }),
      request("/assets/app.js", { cache: "no-store" }),
    ];
    for (const target of cases) {
      const result = await worker.dispatch("fetch", { request: target });
      expect(result.responded, target.url).toBe(false);
    }
    // Nothing leaked into a cache while doing so.
    const staticCache = await worker.cacheStorage.open("hishab-static-v1");
    expect([...staticCache.entries.keys()]).toEqual([]);
  });

  it("caches a hashed static asset on first load and serves it offline", async () => {
    let online = true;
    const worker = createWorker(async () => {
      if (!online) throw new TypeError("Failed to fetch");
      return new Response("console.log('app')", {
        status: 200,
        headers: { "content-type": "text/javascript" },
      });
    });
    const asset = request("/assets/app-1234.js");

    const first = await worker.dispatch("fetch", { request: asset });
    expect(await first.response!.text()).toContain("console.log");

    online = false;
    const second = await worker.dispatch("fetch", { request: asset });
    expect(await second.response!.text()).toContain("console.log");
  });

  it("does not cache a failed static response", async () => {
    const worker = createWorker(async () => new Response("nope", { status: 404 }));
    await worker.dispatch("fetch", { request: request("/assets/missing.js") });
    const staticCache = await worker.cacheStorage.open("hishab-static-v1");
    expect([...staticCache.entries.keys()]).toEqual([]);
  });

  it("keeps Bangla fonts available offline", async () => {
    let online = true;
    const worker = createWorker(async () => {
      if (!online) throw new TypeError("Failed to fetch");
      return new Response("woff2-bytes", { status: 200 });
    });
    const font = request(`${ORIGIN}/s/noto/v1/font.woff2`);
    font.url = "https://fonts.gstatic.com/s/noto/v1/font.woff2";

    await worker.dispatch("fetch", { request: font });
    online = false;
    const cached = await worker.dispatch("fetch", { request: font });
    expect(await cached.response!.text()).toBe("woff2-bytes");
  });

  it("replaces the offline shell with the newest navigation response", async () => {
    let version = "v1";
    const worker = createWorker(
      async () =>
        new Response(`<html>${version}</html>`, {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
    );

    await worker.dispatch("fetch", { request: request("/", { mode: "navigate" }) });
    version = "v2";
    await worker.dispatch("fetch", { request: request("/", { mode: "navigate" }) });

    const cache = await worker.cacheStorage.open("hishab-shell-v1");
    expect(await (await cache.match("/"))!.text()).toContain("v2");
  });

  it("activates a waiting worker only when the page asks", async () => {
    const worker = createWorker(servePublic);
    await worker.dispatch("message", { data: { type: "ignored" } });
    expect(worker.skipWaiting).not.toHaveBeenCalled();

    await worker.dispatch("message", { data: { type: "SKIP_WAITING" } });
    expect(worker.skipWaiting).toHaveBeenCalledTimes(1);
  });
});
