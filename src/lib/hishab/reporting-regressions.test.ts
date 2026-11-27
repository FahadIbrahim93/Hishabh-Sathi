import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  apply,
  audit,
  buildCollection,
  buildExpense,
  buildOpening,
  buildPayment,
  buildReversal,
  buildSale,
  cogsBetween,
  collectedBetween,
  expenseBetween,
  profitBetween,
  revenueBetween,
} from "./engine.ts";
import type { Books, Product } from "./types.ts";

const DAY = 86_400_000;
const START = Date.UTC(2026, 10, 20);
const END = START + DAY;
const product: Product = {
  id: "lighter",
  name: "Lighter",
  aliases: [],
  packName: "case",
  packSize: 50,
  pricePaisa: 1_000,
  costPaisa: 500,
};

function freshBooks(): Books {
  const catalog: Books = {
    version: 1,
    businessName: "Test distributor",
    mode: "stock",
    parties: [{ id: "shop", name: "Shop", aliases: [], role: "customer" }],
    products: [product],
    entries: [],
  };
  return apply(
    catalog,
    buildOpening({
      id: "opening",
      at: START - DAY,
      cashPaisa: 100_000,
      products: [product],
      stock: [{ productId: product.id, qty: 10, costPaisa: product.costPaisa }],
    }),
  );
}

describe("journal-based reports preserve profit and collection corrections", () => {
  it("counts ordinary expenses and party-less cash payments as costs", () => {
    let books = freshBooks();
    const rent = buildExpense(books, {
      id: "rent",
      at: START + 1_000,
      amountPaisa: 50_000,
      label: "Rent",
    });
    books = apply(books, rent);
    assert.equal(expenseBetween(books, START, END), 50_000);
    assert.equal(profitBetween(books, START, END), -50_000);

    books = apply(
      books,
      buildPayment(books, {
        id: "unassigned-payment",
        at: START + 2_000,
        amountPaisa: 10_000,
      }),
    );
    assert.equal(expenseBetween(books, START, END), 60_000);
    assert.equal(profitBetween(books, START, END), -60_000);
    assert.equal(audit(books).ok, true);
  });

  it("nets expense reversals against the original expense, without deleting history", () => {
    let books = freshBooks();
    const rent = buildExpense(books, {
      id: "rent",
      at: START + 1_000,
      amountPaisa: 15_000,
      label: "Rent",
    });
    books = apply(books, rent);
    books = apply(
      books,
      buildReversal({
        id: "undo-rent",
        at: START + 2_000,
        original: rent,
        reason: "entered twice",
      }),
    );
    assert.equal(books.entries.length, 3);
    assert.equal(expenseBetween(books, START, END), 0);
    assert.equal(profitBetween(books, START, END), 0);
    assert.equal(audit(books).ok, true);
  });

  it("nets a reversed sale's revenue and COGS to zero", () => {
    let books = freshBooks();
    const sale = buildSale(books, {
      id: "sale",
      at: START + 1_000,
      partyId: "shop",
      productId: product.id,
      qty: 2,
      receivedPaisa: 0,
    });
    books = apply(books, sale);
    assert.equal(revenueBetween(books, START, END), 2_000);
    assert.equal(cogsBetween(books, START, END), 1_000);
    assert.equal(profitBetween(books, START, END), 1_000);
    books = apply(
      books,
      buildReversal({
        id: "undo-sale",
        at: START + 2_000,
        original: sale,
        reason: "wrong sale",
      }),
    );
    assert.equal(revenueBetween(books, START, END), 0);
    assert.equal(cogsBetween(books, START, END), 0);
    assert.equal(profitBetween(books, START, END), 0);
    assert.equal(audit(books).ok, true);
  });

  it("removes a reversed due collection from the collected total", () => {
    let books = freshBooks();
    books = apply(
      books,
      buildSale(books, {
        id: "prior-sale",
        at: START - 1_000,
        partyId: "shop",
        productId: product.id,
        qty: 1,
        receivedPaisa: 0,
      }),
    );
    const collection = buildCollection(books, {
      id: "collection",
      at: START + 1_000,
      partyId: "shop",
      amountPaisa: 600,
    });
    books = apply(books, collection);
    assert.equal(collectedBetween(books, START, END), 600);
    books = apply(
      books,
      buildReversal({
        id: "undo-collection",
        at: START + 2_000,
        original: collection,
        reason: "receipt error",
      }),
    );
    assert.equal(collectedBetween(books, START, END), 0);
    assert.equal(audit(books).ok, true);
    assert.equal(collectedBetween(books, START - DAY, START), 0);
  });

  it("uses inclusive start and exclusive end for report windows", () => {
    let books = freshBooks();
    books = apply(
      books,
      buildExpense(books, {
        id: "outside-window",
        at: END,
        amountPaisa: 1_000,
        label: "Later",
      }),
    );
    assert.equal(expenseBetween(books, START, END), 0);
    assert.equal(expenseBetween(books, END, END + DAY), 1_000);
  });
});
