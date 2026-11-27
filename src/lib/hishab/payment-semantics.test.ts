import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  apply,
  balance,
  buildOpening,
  buildPayment,
  buildPurchase,
  explain,
} from "./engine.ts";
import type { Books, Entry, Product } from "./types.ts";

const AT = Date.UTC(2026, 10, 28, 12);
const product: Product = {
  id: "lighter",
  name: "Lighter",
  aliases: [],
  packName: "case",
  packSize: 50,
  pricePaisa: 2_000,
  costPaisa: 1_000,
};

function startBooks(): Books {
  const empty: Books = {
    version: 1,
    businessName: "Test distributor",
    mode: "stock",
    parties: [
      { id: "supplier", name: "Factory", aliases: [], role: "supplier" },
      { id: "customer", name: "Shop", aliases: [], role: "customer" },
    ],
    products: [product],
    entries: [],
  };
  return apply(
    empty,
    buildOpening({
      id: "opening",
      at: AT - 1_000,
      cashPaisa: 100_000,
      products: [product],
      stock: [],
    }),
  );
}

function owedBooks(): Books {
  const books = startBooks();
  return apply(
    books,
    buildPurchase(books, {
      id: "purchase",
      at: AT,
      partyId: "supplier",
      productId: product.id,
      qty: 1,
      costPaisa: 1_000,
      paidPaisa: 0,
    }),
  );
}

function relabel(entry: Entry, label: string): Entry {
  return { ...entry, meta: { ...entry.meta, label } };
}

describe("payment meaning follows journal lines, never a mutable Bangla label", () => {
  it("rejects a stale supplier payment even when its label spelling changes", () => {
    const withDebt = owedBooks();
    const first = buildPayment(withDebt, {
      id: "first",
      at: AT + 1_000,
      partyId: "supplier",
      amountPaisa: 600,
    });
    const after = apply(withDebt, first);
    assert.equal(balance(after, "payable", "supplier"), 400);

    const stale = buildPayment(withDebt, {
      id: "stale",
      at: AT + 2_000,
      partyId: "supplier",
      amountPaisa: 600,
    });
    // A different Unicode/wording in display metadata must not bypass validation.
    assert.throws(
      () => apply(after, relabel(stale, "দেনা শোধ")),
      /দেনা/,
    );
    assert.equal(balance(after, "payable", "supplier"), 400);
  });

  it("checks the journal party even when outer party metadata is inconsistent", () => {
    const withDebt = owedBooks();
    const paid = apply(
      withDebt,
      buildPayment(withDebt, {
        id: "first",
        at: AT + 1_000,
        partyId: "supplier",
        amountPaisa: 600,
      }),
    );
    const stale = buildPayment(withDebt, {
      id: "stale",
      at: AT + 2_000,
      partyId: "supplier",
      amountPaisa: 600,
    });
    const inconsistent: Entry = { ...relabel(stale, "anything"), partyId: "customer" };
    assert.throws(() => apply(paid, inconsistent), /দেনা/);
  });

  it("explains supplier settlement from payable debit despite a renamed label", () => {
    const books = owedBooks();
    const payment = buildPayment(books, {
      id: "pay-supplier",
      at: AT + 1_000,
      partyId: "supplier",
      amountPaisa: 300,
    });
    const view = explain(books, relabel(payment, "renamed"));
    assert.ok(view.rows.some((row) => row.k === "দেনা কমেছে"));
    assert.match(view.foot ?? "", /দেনা শোধ/);
  });

  it("explains a customer advance from receivable debit across Unicode spellings", () => {
    const books = startBooks();
    const advance = buildPayment(books, {
      id: "advance",
      at: AT + 1_000,
      partyId: "customer",
      amountPaisa: 300,
    });
    const view = explain(books, relabel(advance, "পাওনা বাড়বে"));
    assert.ok(view.rows.some((row) => row.k === "পাওনা বেড়েছে"));
    assert.match(view.foot ?? "", /পাওনা/);
  });

  it("still treats a party-less payment as an expense", () => {
    const books = startBooks();
    const payment = buildPayment(books, {
      id: "expense",
      at: AT + 1_000,
      amountPaisa: 300,
    });
    const result = apply(books, relabel(payment, "anything"));
    assert.equal(balance(result, "expense"), 300);
    assert.equal(balance(result, "cash"), 99_700);
  });
});
