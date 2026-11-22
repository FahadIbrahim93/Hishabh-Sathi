import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  apply,
  audit,
  balance,
  buildCollection,
  buildExpense,
  buildPurchase,
  buildReturn,
  buildReversal,
  buildSale,
  collectedBetween,
  duesAging,
  expenseBetween,
  profitBetween,
  stockAt,
} from "./engine.ts";
import { takaToPaisa } from "./money.ts";
import { WAREHOUSE, type Books } from "./types.ts";

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 10, 10, 6);

function shop(): Books {
  return {
    version: 1,
    businessName: "Regression shop",
    mode: "stock",
    parties: [
      { id: "rahim", name: "Rahim", aliases: [], role: "customer" },
      { id: "supplier", name: "Supplier", aliases: [], role: "supplier" },
    ],
    products: [
      {
        id: "soap",
        name: "Soap",
        aliases: [],
        packName: "case",
        packSize: 1,
        pricePaisa: 10_000,
        costPaisa: 6_000,
      },
    ],
    entries: [
      {
        id: "open",
        kind: "opening",
        at: T0 - 10 * DAY,
        summary: "opening",
        lines: [
          { account: "inventory", debit: 600_000, credit: 0 },
          { account: "cash", debit: 1_000_000, credit: 0 },
          { account: "capital", debit: 0, credit: 1_600_000 },
        ],
        stock: [{ productId: "soap", location: WAREHOUSE, qtyDelta: 100 }],
        meta: {},
      },
    ],
  };
}

const sellTen = (books: Books, at = T0, receivedPaisa = 100_000) =>
  buildSale(books, {
    id: `sale-${at}`,
    at,
    partyId: "rahim",
    productId: "soap",
    qty: 10,
    receivedPaisa,
  });

describe("reports follow the journal", () => {
  it("counts an expense in the month's expenses and profit", () => {
    let books = shop();
    books = apply(
      books,
      buildExpense(books, { id: "rent", at: T0, amountPaisa: 50_000, label: "rent" }),
    );
    assert.equal(expenseBetween(books, T0 - DAY, T0 + DAY), 50_000);
    assert.equal(profitBetween(books, T0 - DAY, T0 + DAY), -50_000);
  });

  it("gives zero profit for a sale that was reversed", () => {
    let books = shop();
    const sale = sellTen(books);
    books = apply(books, sale);
    books = apply(books, buildReversal({ id: "undo", at: T0 + 1, original: sale, reason: "typo" }));
    assert.equal(profitBetween(books, T0 - DAY, T0 + DAY), 0);
  });

  it("does not count a reversed collection as money collected", () => {
    let books = shop();
    books = apply(books, sellTen(books, T0 - 5 * DAY, 0));
    const collection = buildCollection(books, {
      id: "col",
      at: T0,
      partyId: "rahim",
      amountPaisa: 60_000,
    });
    books = apply(books, collection);
    books = apply(
      books,
      buildReversal({ id: "undo", at: T0 + 1, original: collection, reason: "wrong shop" }),
    );
    assert.equal(collectedBetween(books, T0 - 1, T0 + DAY), 0);
  });

  it("ages a due from the oldest unpaid sale, not the latest payment", () => {
    let books = shop();
    books = apply(books, sellTen(books, T0, 0));
    books = apply(
      books,
      buildCollection(books, {
        id: "one-taka",
        at: T0 + 89 * DAY,
        partyId: "rahim",
        amountPaisa: 100,
      }),
    );
    const [row] = duesAging(books, T0 + 90 * DAY);
    assert.equal(row?.days, 90);
    assert.equal(row?.bucket, "30+");
  });
});

describe("reversals and returns cannot both undo one sale", () => {
  it("refuses a sold-goods return for a sale that was already reversed", () => {
    let books = shop();
    const sale = sellTen(books);
    books = apply(books, sale);
    books = apply(
      books,
      buildReversal({ id: "undo", at: T0 + 1, original: sale, reason: "never happened" }),
    );
    assert.throws(() =>
      buildReturn(books, {
        id: "ret",
        at: T0 + 2,
        partyId: "rahim",
        productId: "soap",
        qty: 10,
        unitPricePaisa: 10_000,
        mode: "sold",
      }),
    );
    assert.equal(stockAt(books, "soap", WAREHOUSE), 100);
  });

  it("refuses to reverse a sale whose goods already came back as a return", () => {
    let books = shop();
    const sale = sellTen(books);
    books = apply(books, sale);
    books = apply(
      books,
      buildReturn(books, {
        id: "ret",
        at: T0 + 1,
        partyId: "rahim",
        productId: "soap",
        qty: 10,
        unitPricePaisa: 10_000,
        mode: "sold",
      }),
    );
    assert.throws(() =>
      apply(books, buildReversal({ id: "undo", at: T0 + 2, original: sale, reason: "x" })),
    );
    assert.equal(stockAt(books, "soap", WAREHOUSE), 100);
  });

  it("refuses a reversal that would leave negative cash", () => {
    let books = shop();
    const sale = buildSale(books, {
      id: "cash-sale",
      at: T0,
      productId: "soap",
      qty: 10,
      receivedPaisa: 100_000,
    });
    books = apply(books, sale);
    books = apply(
      books,
      buildExpense(books, { id: "spend", at: T0 + 1, amountPaisa: 1_100_000, label: "stock run" }),
    );
    assert.throws(() =>
      apply(books, buildReversal({ id: "undo", at: T0 + 2, original: sale, reason: "x" })),
    );
  });
});

describe("cost and money precision", () => {
  it("restores the average cost when a purchase is reversed", () => {
    let books = shop();
    const purchase = buildPurchase(books, {
      id: "buy",
      at: T0,
      partyId: "supplier",
      productId: "soap",
      qty: 100,
      costPaisa: 20_000,
      paidPaisa: 0,
    });
    books = apply(books, purchase);
    books = apply(
      books,
      buildReversal({ id: "undo", at: T0 + 1, original: purchase, reason: "wrong price" }),
    );
    assert.equal(books.products[0]?.costPaisa, 6_000);
    books = apply(
      books,
      buildSale(books, {
        id: "all",
        at: T0 + 2,
        productId: "soap",
        qty: 100,
        receivedPaisa: 1_000_000,
      }),
    );
    assert.equal(balance(books, "inventory"), 0);
    assert.equal(audit(books).ok, true);
  });

  it("keeps poisha when converting a typed taka amount", () => {
    assert.equal(takaToPaisa(15.5), 1_550);
    assert.equal(takaToPaisa(10.25), 1_025);
    assert.equal(takaToPaisa(0.29), 29);
    assert.equal(takaToPaisa(500), 50_000);
  });
});
