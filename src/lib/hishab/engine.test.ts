import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  apply,
  audit,
  balance,
  buildCollection,
  buildConsign,
  buildSale,
  collectedBetween,
  revenueBetween,
  stockAt,
} from "./engine.ts";
import { draftFromParse, parseUtterance, SAMPLES } from "./parser.ts";
import { entryFromDraft, firstGap, previewDraft, READBACK_LIGHTER, readback } from "./flow.ts";
import { banglaUnder100, startOfLocalDay, takaWords } from "./money.ts";
import { makeSeed } from "./seed.ts";
import { WAREHOUSE, partyLoc, type Books } from "./types.ts";

const now = new Date(2026, 10, 9, 15, 0, 0, 0).getTime();

describe("bangla money words", () => {
  it("counts one to ninety-nine", () => {
    assert.equal(banglaUnder100(0), "");
    assert.equal(banglaUnder100(15), "পনেরো");
    assert.equal(banglaUnder100(99), "নিরানব্বই");
  });

  it("speaks the lighter example amounts", () => {
    assert.equal(takaWords(1000), "এক হাজার");
    assert.equal(takaWords(600), "ছয়শ");
    assert.equal(takaWords(400), "চারশ");
    assert.equal(takaWords(2500), "দুই হাজার পাঁচশ");
    assert.equal(takaWords(12400), "বারো হাজার চারশ");
  });
});

describe("seed ledger", () => {
  const books = makeSeed(now);
  const start = startOfLocalDay(now);

  it("matches the shopkeeper dashboard", () => {
    assert.equal(revenueBetween(books, start, start + 86_400_000), 250_000);
    assert.equal(collectedBetween(books, start, start + 86_400_000), 180_000);
    assert.equal(balance(books, "receivable"), 1_240_000);
    assert.equal(stockAt(books, "lighter", WAREHOUSE), 2500);
    assert.equal(stockAt(books, "lighter", partyLoc("rahim")), 50);
    assert.equal(balance(books, "receivable", "rahim"), 800_000);
  });

  it("balances every taka and never loses stock", () => {
    const report = audit(books);
    assert.equal(report.ok, true);
    assert.equal(report.debit, report.credit);
    assert.equal(balance(books, "cash"), 680_000);
  });
});

describe("commands", () => {
  const books = makeSeed(now);

  it("sells two cases of lighters on partial cash", () => {
    const entry = buildSale(books, {
      id: "case-sale",
      at: now,
      partyId: "rahim",
      productId: "lighter",
      qty: 100,
      unitPricePaisa: 1000,
      receivedPaisa: 60_000,
    });
    const next = apply(books, entry);
    assert.equal(stockAt(next, "lighter", WAREHOUSE), 2400);
    assert.equal(balance(next, "receivable", "rahim"), 840_000);
    assert.equal(balance(next, "revenue") - balance(books, "revenue"), 100_000);
    assert.equal(audit(next).ok, true);
    const again = apply(next, entry);
    assert.equal(again.entries.length, next.entries.length);
    assert.equal(stockAt(again, "lighter", WAREHOUSE), 2400);
  });

  it("refuses to sell stock that is not there", () => {
    assert.throws(
      () =>
        buildSale(books, {
          id: "too-many",
          at: now,
          partyId: "rahim",
          productId: "lighter",
          qty: 2550,
          unitPricePaisa: 1000,
          receivedPaisa: 0,
        }),
      /গুদামে/,
    );
  });

  it("moves consignment without a sale or a due", () => {
    const beforeDue = balance(books, "receivable");
    const beforeRevenue = balance(books, "revenue");
    const next = apply(
      books,
      buildConsign(books, {
        id: "leave",
        at: now,
        partyId: "nur",
        productId: "lighter",
        qty: 50,
      }),
    );
    assert.equal(balance(next, "receivable"), beforeDue);
    assert.equal(balance(next, "revenue"), beforeRevenue);
    assert.equal(stockAt(next, "lighter", WAREHOUSE), 2450);
    assert.equal(stockAt(next, "lighter", partyLoc("nur")), 50);
    assert.equal(audit(next).ok, true);
  });

  it("collects an old due without a second sale", () => {
    const next = apply(
      books,
      buildCollection(books, { id: "got", at: now, partyId: "karim", amountPaisa: 50_000 }),
    );
    assert.equal(balance(next, "receivable", "karim"), 0);
    assert.equal(balance(next, "revenue"), balance(books, "revenue"));
    assert.equal(audit(next).ok, true);
  });
});

describe("voice stays a form, not a posting", () => {
  const books = makeSeed(now);

  it("reads the lighter sentence back and waits", () => {
    const parsed = parseUtterance(SAMPLES.sale, books);
    const draft = draftFromParse(SAMPLES.sale, parsed, books);
    assert.equal(parsed.kind, "sale");
    assert.equal(parsed.partyId, "rahim");
    assert.equal(parsed.productId, "lighter");
    assert.equal(parsed.qtyInput, 2);
    assert.equal(parsed.unit, "pack");
    assert.equal(parsed.unitPriceTaka, 10);
    assert.equal(parsed.receivedTaka, 600);
    assert.equal(firstGap(draft, books), "confirm");
    assert.equal(readback(draft, books), READBACK_LIGHTER);
    const view = previewDraft(books, draft, now);
    assert.equal(view.ok, true);
    if (view.ok) {
      const next = apply(books, entryFromDraft(books, draft, "spoken", now));
      assert.equal(stockAt(next, "lighter", WAREHOUSE), 2400);
      assert.equal(balance(next, "receivable", "rahim"), 840_000);
    }
  });

  it("tells consign from sale and collection", () => {
    const left = parseUtterance(SAMPLES.consign, books);
    assert.equal(left.kind, "consign");
    assert.equal(left.partyId, "nur");
    assert.equal(left.qtyInput, 1);
    const paid = parseUtterance(SAMPLES.collect, books);
    assert.equal(paid.kind, "collection");
    assert.equal(paid.partyId, "karim");
    assert.equal(paid.receivedTaka, 500);
    const mixed = parseUtterance("রহিম স্টোরে দুই কেস লাইটার রেখে এসেছি বিক্রিও করেছি", books);
    assert.equal(mixed.kind, null);
  });
});

describe("audit never throws", () => {
  it("returns ok:false instead of throwing on a malformed entry", () => {
    const bad: Books = {
      version: 1,
      businessName: "x",
      mode: "stock",
      parties: [],
      products: [],
      entries: [
        {
          id: "bad-1",
          kind: "sale",
          at: now,
          summary: "unbalanced",
          lines: [{ account: "cash", debit: 100, credit: 0 }],
          stock: [],
          meta: {},
        },
      ],
    };
    // Must not throw; must report not-ok.
    const report = audit(bad);
    assert.equal(report.ok, false);
  });
});
