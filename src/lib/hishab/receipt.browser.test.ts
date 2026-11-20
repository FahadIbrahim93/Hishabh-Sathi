import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, type Page } from "playwright";
import { createServer } from "vite";
import { expect, it } from "vitest";
import type { Books } from "./types.ts";

// GitHub's Ubuntu runner supplies Chrome. Local runs can use Playwright Chromium.
const chrome = [process.env.CHROME_BIN, "/usr/bin/google-chrome", chromium.executablePath()]
  .find((path): path is string => Boolean(path && existsSync(path)));

const fixture = `<html lang="bn"><body><div id="root"></div><script type="module">
  import {createElement} from "react";
  import {createRoot} from "react-dom/client";
  import {HishabApp} from "/src/components/hishab/app.tsx";
  import {useHishab} from "/src/lib/hishab/store.ts";
  import {makeSeed} from "/src/lib/hishab/seed.ts";
  import {balance} from "/src/lib/hishab/engine.ts";
  import {blankDraft} from "/src/lib/hishab/flow.ts";
  const firstVisit = !sessionStorage.getItem("seeded");
  if (firstVisit) localStorage.setItem("hishab-sathi-v1", JSON.stringify(makeSeed()));
  if (firstVisit) {
    await useHishab.getState().hydrate();
    sessionStorage.setItem("seeded", "1");
    useHishab.getState().openDraft(blankDraft("collection", {
      step: "confirm", partyId: "rahim", amountTaka: 600
    }));
  }
  window.exportTestBooks = () => useHishab.getState().exportBooks();
  window.readReceiptBooks = () => {
    const books = useHishab.getState().books;
    return {
      entries: books.entries.filter(entry => entry.kind === "collection").length,
      due: balance(books, "receivable", "rahim")
    };
  };
  createRoot(document.getElementById("root")).render(createElement(HishabApp));
</script></body></html>`;

async function withReceiptPage(run: (page: Page) => Promise<void>) {
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
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(new URL("/receipt-test", server.resolvedUrls!.local[0]).href);
      await run(page);
    } finally {
      await browser.close();
    }
  } finally {
    await server.close();
  }
}

const browserTest = it.skipIf(!chrome && !process.env.CI);
browserTest("retries an aborted device write from the Bangla form and reloads one collection", () => withReceiptPage(async page => {
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
  const result = await page.evaluate("window.readReceiptBooks()");
  // Seeded Rahim owes ৳8,000. One ৳600 payment leaves ৳7,400.
  expect(result).toEqual({ entries: 1, due: 740_000 });

  // Reopen the same book with one transient IndexedDB read failure.
  await page.addInitScript(() => {
    const get = IDBObjectStore.prototype.get;
    IDBObjectStore.prototype.get = function (...args) {
      const request = get.apply(this, args);
      if (this.name === "books") {
        IDBObjectStore.prototype.get = get;
        this.transaction.abort();
      }
      return request;
    };
  });
  await page.reload();
  const retry = page.getByRole("button", { name: "আবার চেষ্টা করুন", exact: true });
  await retry.waitFor();
  expect(await page.locator('[data-screen="home"]').count()).toBe(0);
  expect(await page.getByText("দোকানের নাম", { exact: true }).count()).toBe(0);
  await retry.click();
  await page.locator('[data-screen="home"]').waitFor();
  expect(await page.evaluate("window.readReceiptBooks()")).toEqual(result);
}), 90_000);

browserTest("rejects a damaged file, keeps the live ledger on write failure, and restores a valid export", () => withReceiptPage(async page => {
  const save = page.getByRole("button", { name: "সেভ করুন", exact: true });
  await save.waitFor();
  const backup: string = await page.evaluate("window.exportTestBooks()");
  await save.click();
  await page.locator('[data-screen="receipt"]').waitFor();
  const current: string = await page.evaluate("window.exportTestBooks()");
  const reopen = async () => {
    await page.reload();
    await page.locator('[data-screen="home"]').waitFor();
    return page.evaluate("window.exportTestBooks()");
  };
  const choose = async (json: string) => {
    await page.getByRole("button", { name: "আরও", exact: true }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: "books.json", mimeType: "application/json", buffer: Buffer.from(json),
    });
  };
  const restore = page.getByRole("button", { name: "ফেরত আনুন", exact: true });
  const damaged = JSON.parse(backup);
  damaged.entries[0].lines[0].debit += 1;
  expect(await reopen()).toBe(current);
  await choose(JSON.stringify(damaged));
  await restore.click();
  await page.getByRole("alert").filter({ hasText: "ব্যাকআপ" }).waitFor();
  expect(await reopen()).toBe(current);

  await choose(backup);
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      IDBObjectStore.prototype.put = put;
      const request = put.apply(this, args);
      this.transaction.abort();
      return request;
    };
  });
  await restore.click();
  await page.getByRole("alert").filter({ hasText: "সেভ হয়নি" }).waitFor();
  expect(await reopen()).toBe(current);

  await choose(backup);
  await restore.click();
  await page.getByText("ব্যাকআপ ফেরত আনা হয়েছে", { exact: true }).waitFor();
  expect(await reopen()).toBe(backup);
  expect(await page.evaluate("window.readReceiptBooks()")).toEqual({ entries: 0, due: 800_000 });
}), 90_000);

browserTest("retries a failed reversal and prevents another tab from doubling it", () => withReceiptPage(async page => {
  await page.getByRole("button", { name: "সেভ করুন", exact: true }).click();
  await page.locator('[data-screen="receipt"]').waitFor();
  const exported: string = await page.evaluate("window.exportTestBooks()");
  const payment = (JSON.parse(exported) as Books).entries.at(-1)!;
  const openPayment = async (tab: Page) => {
    await tab.reload();
    await tab.locator('[data-screen="home"]').waitFor();
    await tab.getByText(payment.summary, { exact: true }).click();
  };
  const reason = (tab: Page) => tab.getByPlaceholder("কেন বিলোপ করছেন?");
  const reverse = (tab: Page) => tab.getByRole("button", { name: "বিলোপ করুন", exact: true });
  await openPayment(page);
  const stale = await page.context().newPage();
  await stale.goto(page.url());
  await openPayment(stale);
  await reason(stale).fill("দ্বিতীয় ট্যাব");
  await reason(page).fill("ভুল অঙ্ক");
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      IDBObjectStore.prototype.put = put;
      const request = put.apply(this, args);
      this.transaction.abort();
      return request;
    };
  });
  await reverse(page).click();
  await page.getByRole("alert").filter({ hasText: "সেভ হয়নি" }).waitFor();
  expect(await reason(page).inputValue()).toBe("ভুল অঙ্ক");
  expect(await page.evaluate("window.exportTestBooks()")).toBe(exported);
  await reverse(page).click();
  await page.locator('[data-screen="home"]').waitFor();
  await reverse(stale).click();
  await stale.getByRole("alert").filter({ hasText: "হিসাব বদলেছে" }).waitFor();
  for (const tab of [stale, page]) {
    await openPayment(tab);
    await tab.getByText("এই হিসাব আগেই বিলোপ করা হয়েছে।", { exact: true }).waitFor();
    expect(await reverse(tab).count()).toBe(0);
    const raw: string = await tab.evaluate("window.exportTestBooks()");
    const restored = JSON.parse(raw) as Books;
    const linked = restored.entries.filter(row => row.reversesEntryId === payment.id);
    expect(linked.map(row => row.meta.reason)).toEqual(["ভুল অঙ্ক"]);
    expect(await tab.evaluate("window.readReceiptBooks()")).toEqual({ entries: 1, due: 800_000 });
  }
}), 90_000);

browserTest("keeps a newer collection when a stale tab changes the book mode", () => withReceiptPage(async page => {
  const confirm = page.getByRole("button", { name: "সেভ করুন", exact: true });
  await confirm.waitFor();
  const stale = await page.context().newPage();
  await stale.goto(page.url());
  await stale.getByRole("button", { name: "সেভ করুন", exact: true }).waitFor();
  await stale.reload();
  await stale.getByRole("button", { name: "আরও", exact: true }).click();
  await confirm.click();
  await page.locator('[data-screen="receipt"]').waitFor();
  const expected = await page.evaluate("window.exportTestBooks()");
  await stale.getByRole("button", { name: /সহজ খাতা/ }).click();
  await stale.getByText("হিসাব বদলেছে। আবার খুলে পাওনা মিলিয়ে নিন।", { exact: true }).waitFor();
  await stale.reload();
  await stale.locator('[data-screen="home"]').waitFor();
  expect(await stale.evaluate("window.exportTestBooks()")).toBe(expected);
  expect(await stale.evaluate("window.readReceiptBooks()")).toEqual({ entries: 1, due: 740_000 });
}), 90_000);
