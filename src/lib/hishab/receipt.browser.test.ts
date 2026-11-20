import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";
import { expect, it } from "vitest";

// GitHub's Ubuntu runner supplies Chrome. Local runs can use Playwright Chromium.
const chrome = [process.env.CHROME_BIN, "/usr/bin/google-chrome", chromium.executablePath()]
  .find((path): path is string => Boolean(path && existsSync(path)));

const fixture = `<html lang="bn"><body><div id="root"></div><script type="module">
  import {createElement} from "react";
  import {createRoot} from "react-dom/client";
  import {HishabApp} from "/src/components/hishab/app.tsx";
  import {useHishab} from "/src/lib/hishab/store.ts";
  import {makeSeed} from "/src/lib/hishab/seed.ts";
  import {blankDraft} from "/src/lib/hishab/flow.ts";
  const firstVisit = !sessionStorage.getItem("seeded");
  if (firstVisit) localStorage.setItem("hishab-sathi-v1", JSON.stringify(makeSeed()));
  await useHishab.getState().hydrate();
  if (firstVisit) {
    sessionStorage.setItem("seeded", "1");
    useHishab.getState().openDraft(blankDraft("collection", {
      step: "confirm", partyId: "rahim", amountTaka: 600
    }));
  }
  createRoot(document.getElementById("root")).render(createElement(HishabApp));
</script></body></html>`;

it.skipIf(!chrome && !process.env.CI)("retries an aborted device write from the Bangla form and reloads one collection", async () => {
  const server = await createServer({
    configFile: false,
    resolve: { alias: { "@": resolve("src") } },
    server: { host: "127.0.0.1", port: 0 },
    plugins: [{
      name: "receipt-test-page",
      configureServer(vite) {
        vite.middlewares.use("/receipt-test", (_req, res, next) => {
          vite.transformIndexHtml("/receipt-test", fixture).then((html) => {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
          }).catch(next);
        });
      },
    }],
  });
  try {
    await server.listen();
    const browser = await chromium.launch({ executablePath: chrome });
    try {
      const page = await browser.newPage();
      await page.goto(new URL("/receipt-test", server.resolvedUrls!.local[0]).href);
      const save = page.getByRole("button", { name: "সেভ করুন", exact: true });
      await save.waitFor();
      await page.evaluate(() => {
        const put = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (...args) {
          IDBObjectStore.prototype.put = put;
          const request = put.apply(this, args);
          this.transaction.abort();
          return request;
        };
      });
      await save.click();
      await page.getByText("এই ফোনে সেভ হয়নি। আবার চেষ্টা করুন।", { exact: true }).waitFor();
      expect(await page.locator('[data-screen="receipt"]').count()).toBe(0);
      await save.click();
      await page.locator('[data-screen="receipt"]').waitFor();
      await page.reload();
      await page.locator('[data-screen="home"]').waitFor();
      const result = await page.evaluate(async ([storePath, enginePath]) => {
        const { useHishab } = await import(storePath);
        const { balance } = await import(enginePath);
        const books = useHishab.getState().books;
        return {
          entries: books.entries.filter((e: { kind: string }) => e.kind === "collection").length,
          due: balance(books, "receivable", "rahim"),
        };
      }, ["/src/lib/hishab/store.ts", "/src/lib/hishab/engine.ts"]);
      // Seeded Rahim owes ৳8,000. One ৳600 payment leaves ৳7,400.
      expect(result).toEqual({ entries: 1, due: 740_000 });
    } finally {
      await browser.close();
    }
  } finally {
    await server.close();
  }
}, 90_000);
