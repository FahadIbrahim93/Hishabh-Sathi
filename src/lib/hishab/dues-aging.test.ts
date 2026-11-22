import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { apply, balance, buildSale, duesAging } from "./engine.ts";
import { WAREHOUSE, type Books } from "./types.ts";

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 10, 10, 6);

function shop(): Books {
  return {
    version: 1,
    businessName: "Aging shop",
    mode: "stock",
    parties: [
      { id: "rahim", name: "Rahim", aliases: [], role: "customer" },
      { id: "karim", name: "Karim", aliases: [], role: "customer" },
    ],
    products: [
      {
        id: "soap",
        name: "Soap",
        aliases: [],
        packName: "case",
        packSize: 1,
        pricePaisa: 2_000,
        costPaisa: 1_000,
      },
    ],
    entries: [
      {
        id: "open",
        kind: "opening",
        at: T0 - DAY,
        summary: "opening",
        lines: [
          { account: "inventory", debit: 100_000, credit: 0 },
          { account: "capital", debit: 0, credit: 100_000 },
        ],
        stock: [{ productId: "soap", location: WAREHOUSE, qtyDelta: 100 }],
        meta: {},
      },
    ],
  };
}

function creditSale(books: Books, partyId: string, at: number, qty: number): Books {
  return apply(
    books,
    buildSale(books, {
      id: `sale-${partyId}-${at}`,
      at,
      partyId,
      productId: "soap",
      qty,
      receivedPaisa: 0,
    }),
  );
}

// What archiving does in the store: the shop is hidden from pickers, its history stays.
function archive(books: Books, partyId: string): Books {
  return {
    ...books,
    parties: books.parties.map((p) => (p.id === partyId ? { ...p, archived: true } : p)),
  };
}

describe("dues aging covers every shop that still owes", () => {
  it("keeps an archived shop's unpaid due in aging", () => {
    let books = creditSale(shop(), "rahim", T0, 1);
    books = archive(books, "rahim");
    const rows = duesAging(books, T0 + 40 * DAY);
    assert.deepEqual(
      rows.map((row) => [row.partyId, row.receivable, row.bucket]),
      [["rahim", 2_000, "30+"]],
    );
  });

  it("adds up to the positive dues of all shops, archived or not", () => {
    let books = creditSale(shop(), "rahim", T0, 3);
    books = creditSale(books, "karim", T0 + 20 * DAY, 2);
    books = archive(books, "karim");
    const rows = duesAging(books, T0 + 25 * DAY);
    const owed = books.parties
      .map((party) => balance(books, "receivable", party.id))
      .filter((due) => due > 0)
      .reduce((sum, due) => sum + due, 0);
    assert.equal(
      rows.reduce((sum, row) => sum + row.receivable, 0),
      owed,
    );
    assert.equal(owed, 10_000);
  });

  it("leaves out an archived shop that owes nothing", () => {
    let books = archive(shop(), "rahim");
    books = creditSale(books, "karim", T0, 1);
    assert.deepEqual(
      duesAging(books, T0 + DAY).map((row) => row.partyId),
      ["karim"],
    );
  });
});
