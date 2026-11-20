import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  apply,
  audit,
  balance,
  buildCollection,
  buildConsign,
  buildExpense,
  buildOpening,
  buildPayment,
  buildPurchase,
  buildReturn,
  buildReversal,
  buildSale,
  reversalFor,
  stockAt,
  stockTotal,
} from "./engine.ts";
import { makeSeed } from "./seed.ts";
import {
  WAREHOUSE,
  partyLoc,
  type Account,
  type Books,
  type Entry,
  type Party,
  type Product,
} from "./types.ts";

// Invariants every accepted posting must preserve, checked on generated books
// rather than on hand-picked examples (CONTRIBUTING: ledger changes require
// property tests). Failures print the seed and the shrunk operation script, so
// a counterexample replays with `fc.assert(..., { seed })`.

const AT = 1_700_000_000_000;
const ACCOUNTS: Account[] = [
  "cash",
  "revenue",
  "cogs",
  "inventory",
  "receivable",
  "payable",
  "expense",
  "capital",
];
const CREDIT_NORMAL = new Set<Account>(["revenue", "payable", "capital"]);

const parties: Party[] = [
  { id: "c1", name: "রহিম স্টোর", aliases: [], role: "customer" },
  { id: "c2", name: "করিম স্টোর", aliases: [], role: "customer" },
  { id: "c3", name: "কামাল ট্রেডার্স", aliases: [], role: "supplier" },
];

interface Catalog {
  cost1: number;
  price1: number;
  pack1: number;
  cost2: number;
  price2: number;
  pack2: number;
  cash: number;
  qty1: number;
  qty2: number;
}

const catalogArb = fc.record({
  cost1: fc.integer({ min: 1, max: 900 }),
  price1: fc.integer({ min: 2, max: 1500 }),
  pack1: fc.constantFrom(1, 6, 12),
  cost2: fc.integer({ min: 1, max: 2500 }),
  price2: fc.integer({ min: 3, max: 4000 }),
  pack2: fc.constantFrom(1, 4, 24),
  cash: fc.integer({ min: 1, max: 200_000 }),
  // At least one unit in the warehouse: every generated script can post a sale.
  qty1: fc.integer({ min: 1, max: 300 }),
  qty2: fc.integer({ min: 0, max: 100 }),
});

function productsOf(catalog: Catalog): Product[] {
  return [
    {
      id: "p1",
      name: "লাইটার",
      aliases: [],
      packName: "কেস",
      packSize: catalog.pack1,
      pricePaisa: catalog.price1,
      costPaisa: catalog.cost1,
    },
    {
      id: "p2",
      name: "সাবান",
      aliases: [],
      packName: "প্যাকেট",
      packSize: catalog.pack2,
      pricePaisa: catalog.price2,
      costPaisa: catalog.cost2,
    },
  ];
}

function openingBooks(catalog: Catalog): Books {
  const products = productsOf(catalog);
  const empty: Books = {
    version: 1,
    businessName: "পরীক্ষা ট্রেডার্স",
    mode: "stock",
    parties,
    products,
    entries: [],
  };
  return apply(
    empty,
    buildOpening({
      id: "opening",
      at: AT,
      cashPaisa: catalog.cash,
      products,
      stock: [
        { productId: "p1", qty: catalog.qty1, costPaisa: catalog.cost1 },
        { productId: "p2", qty: catalog.qty2, costPaisa: catalog.cost2 },
      ],
    }),
  );
}

/** Balance change the entry's own lines ask for, in normal-sign terms. */
function lineEffect(entry: Entry, account: Account): number {
  let effect = 0;
  for (const row of entry.lines) {
    if (row.account !== account) continue;
    effect += CREDIT_NORMAL.has(account) ? row.credit - row.debit : row.debit - row.credit;
  }
  return effect;
}

function locationsOf(books: Books): string[] {
  const locations = new Set<string>([WAREHOUSE]);
  for (const party of books.parties) locations.add(partyLoc(party.id));
  for (const entry of books.entries) for (const move of entry.stock) locations.add(move.location);
  return [...locations];
}

function soldQty(books: Books, partyId: string, productId: string): number {
  let qty = 0;
  for (const entry of books.entries) {
    if (entry.partyId !== partyId || entry.productId !== productId) continue;
    if (entry.kind === "sale") qty += entry.meta.qty ?? 0;
    if (entry.kind === "return" && entry.meta.returnMode === "sold") qty -= entry.meta.qty ?? 0;
  }
  return qty;
}

/**
 * Assertions that must hold after every accepted posting, independent of kind.
 * `before` and `after` differ by exactly one entry; nothing else may change.
 */
function assertStep(before: Books, after: Books, entry: Entry) {
  // Append-only ledger: the past is untouched, ids stay unique.
  expect(after.entries).toHaveLength(before.entries.length + 1);
  expect(after.entries.slice(0, before.entries.length)).toEqual(before.entries);
  expect(after.entries.at(-1)).toBe(entry);
  expect(new Set(after.entries.map((row) => row.id)).size).toBe(after.entries.length);
  expect(after.parties).toEqual(before.parties);
  expect(after.version).toBe(1);

  // Money is integer paisa, and a line is debit or credit, never both.
  for (const row of entry.lines) {
    expect(Number.isInteger(row.debit)).toBe(true);
    expect(Number.isInteger(row.credit)).toBe(true);
    expect(row.debit).toBeGreaterThanOrEqual(0);
    expect(row.credit).toBeGreaterThanOrEqual(0);
    expect(row.debit === 0 || row.credit === 0).toBe(true);
  }
  const debitTotal = entry.lines.reduce((sum, row) => sum + row.debit, 0);
  const creditTotal = entry.lines.reduce((sum, row) => sum + row.credit, 0);
  expect(debitTotal).toBe(creditTotal);
  for (const move of entry.stock) {
    expect(Number.isInteger(move.qtyDelta)).toBe(true);
    expect(move.qtyDelta).not.toBe(0);
  }

  // Every account and party balance moves by exactly what the lines say.
  for (const account of ACCOUNTS) {
    expect(balance(after, account) - balance(before, account)).toBe(lineEffect(entry, account));
  }
  for (const party of before.parties) {
    for (const account of ["receivable", "payable"] as const) {
      const rows = entry.lines.filter((row) => row.account === account && row.partyId === party.id);
      const movement = rows.reduce((sum, row) => sum + row.debit - row.credit, 0);
      // `0 - movement` rather than `-movement`: keeps a zero delta +0, not -0.
      const signed = account === "payable" ? 0 - movement : movement;
      expect(balance(after, account, party.id) - balance(before, account, party.id)).toBe(signed);
    }
  }

  // Stock moves by the entry's deltas, and no location is left negative.
  for (const location of locationsOf(after)) {
    for (const product of before.products) {
      const moved = entry.stock
        .filter((move) => move.productId === product.id && move.location === location)
        .reduce((sum, move) => sum + move.qtyDelta, 0);
      expect(stockAt(after, product.id, location)).toBe(
        stockAt(before, product.id, location) + moved,
      );
      expect(stockAt(after, product.id, location)).toBeGreaterThanOrEqual(0);
    }
    for (const product of after.products) {
      const moved = entry.stock
        .filter((move) => move.productId === product.id)
        .reduce((sum, move) => sum + move.qtyDelta, 0);
      expect(stockTotal(after, product.id)).toBe(stockTotal(before, product.id) + moved);
    }
  }

  // Double entry: trial balance holds and every stored entry re-audits.
  expect(audit(after).ok).toBe(true);
  const debitNormal = ["cash", "cogs", "inventory", "receivable", "expense"] as const;
  const creditNormal = ["revenue", "payable", "capital"] as const;
  const debits = debitNormal.reduce((sum, account) => sum + balance(after, account), 0);
  const credits = creditNormal.reduce((sum, account) => sum + balance(after, account), 0);
  expect(debits).toBe(credits);

  // Replaying the same entry is a no-op, not a second posting.
  expect(apply(after, entry)).toBe(after);

  // Kind-specific meaning of the numbers.
  const cashIn = entry.lines
    .filter((row) => row.account === "cash")
    .reduce((sum, row) => sum + row.debit - row.credit, 0);
  switch (entry.kind) {
    case "sale": {
      const total = entry.meta.total ?? 0;
      const received = entry.meta.received ?? 0;
      expect(cashIn).toBe(received);
      const due = entry.lines
        .filter((row) => row.account === "receivable")
        .reduce((sum, row) => sum + row.debit - row.credit, 0);
      expect(due).toBe(total - received);
      // The sale itself books a non-negative due. The party balance can be in
      // credit from an earlier reversed sale; that is reported, not asserted.
      expect(due).toBeGreaterThanOrEqual(0);
      if (entry.meta.qty != null) {
        expect(total).toBe((entry.meta.qty ?? 0) * (entry.meta.unitPrice ?? 0));
      }
      break;
    }
    case "collection": {
      expect(cashIn).toBe(entry.meta.received ?? 0);
      expect(entry.lines.some((row) => row.account === "revenue")).toBe(false);
      expect(balance(after, "receivable", entry.partyId ?? "")).toBeGreaterThanOrEqual(0);
      break;
    }
    case "payment": {
      expect(cashIn).toBe(-(entry.meta.total ?? 0));
      expect(balance(after, "cash")).toBeGreaterThanOrEqual(0);
      break;
    }
    case "consign": {
      // Consignment is not a sale and not a receivable: no money moves at all.
      expect(entry.lines).toHaveLength(0);
      expect(balance(after, "revenue")).toBe(balance(before, "revenue"));
      expect(balance(after, "receivable")).toBe(balance(before, "receivable"));
      expect(stockTotal(after, entry.productId ?? "")).toBe(
        stockTotal(before, entry.productId ?? ""),
      );
      expect(stockAt(after, entry.productId ?? "", partyLoc(entry.partyId ?? ""))).toBe(
        stockAt(before, entry.productId ?? "", partyLoc(entry.partyId ?? "")) +
          (entry.meta.qty ?? 0),
      );
      break;
    }
    case "return": {
      if (entry.meta.returnMode === "consign") {
        expect(entry.lines).toHaveLength(0);
        expect(balance(after, "revenue")).toBe(balance(before, "revenue"));
        expect(stockTotal(after, entry.productId ?? "")).toBe(
          stockTotal(before, entry.productId ?? ""),
        );
      } else {
        const revenueBack = entry.lines
          .filter((row) => row.account === "revenue")
          .reduce((sum, row) => sum + row.debit - row.credit, 0);
        expect(revenueBack).toBe(entry.meta.total ?? 0);
        expect(stockTotal(after, entry.productId ?? "")).toBe(
          stockTotal(before, entry.productId ?? "") + (entry.meta.qty ?? 0),
        );
      }
      break;
    }
    case "purchase": {
      const stockIn = entry.lines
        .filter((row) => row.account === "inventory")
        .reduce((sum, row) => sum + row.debit - row.credit, 0);
      expect(stockIn).toBe((entry.meta.qty ?? 0) * (entry.meta.unitPrice ?? 0));
      expect(stockTotal(after, entry.productId ?? "")).toBe(
        stockTotal(before, entry.productId ?? "") + (entry.meta.qty ?? 0),
      );
      const product = after.products.find((row) => row.id === entry.productId);
      expect(product?.costPaisa).toBeGreaterThan(0);
      expect(Number.isInteger(product?.costPaisa)).toBe(true);
      break;
    }
    case "expense": {
      const spent = entry.lines
        .filter((row) => row.account === "expense")
        .reduce((sum, row) => sum + row.debit, 0);
      expect(spent).toBe(entry.meta.total ?? 0);
      break;
    }
    case "opening": {
      expect(balance(after, "capital") - balance(before, "capital")).toBe(
        balance(after, "inventory") -
          balance(before, "inventory") +
          (balance(after, "cash") - balance(before, "cash")),
      );
      break;
    }
    default:
      break;
  }
}

/** Build one feasible random operation, or null when the books cannot support it. */
function stepFor(
  books: Books,
  token: number,
  index: number,
): { name: string; build: () => Entry } | null {
  const id = `e${index}`;
  const pick = <T>(list: T[], offset: number): T | undefined =>
    list.length === 0 ? undefined : list[(token + offset) % list.length];
  const party = pick(books.parties, 0);
  if (!party) return null;
  const productsWithStock = books.products.filter(
    (product) => stockAt(books, product.id, WAREHOUSE) > 0,
  );

  switch (token % 9) {
    case 0: {
      const product = pick(productsWithStock, 1);
      if (!product) return null;
      const have = stockAt(books, product.id, WAREHOUSE);
      const qty = 1 + (token % Math.min(have, 8));
      const price = Math.max(1, product.pricePaisa + ((token >> 3) % 3) - 1);
      const total = qty * price;
      const mode = (token >> 5) % 3;
      const received = mode === 0 ? 0 : mode === 1 ? Math.floor(total / 2) : total;
      return {
        name: "sale",
        build: () =>
          buildSale(books, {
            id,
            at: AT + index,
            partyId: party.id,
            productId: product.id,
            qty,
            unitPricePaisa: price,
            receivedPaisa: received,
          }),
      };
    }
    case 1: {
      const product = pick(productsWithStock, 2);
      if (!product) return null;
      const have = stockAt(books, product.id, WAREHOUSE);
      const qty = 1 + (token % Math.min(have, 8));
      return {
        name: "consign",
        build: () =>
          buildConsign(books, {
            id,
            at: AT + index,
            partyId: party.id,
            productId: product.id,
            qty,
          }),
      };
    }
    case 2: {
      const pairs = books.parties.flatMap((row) =>
        books.products
          .filter((product) => stockAt(books, product.id, partyLoc(row.id)) > 0)
          .map((product) => ({ partyId: row.id, productId: product.id })),
      );
      const pair = pick(pairs, 0);
      if (!pair) return null;
      const have = stockAt(books, pair.productId, partyLoc(pair.partyId));
      const qty = 1 + (token % Math.min(have, 5));
      return {
        name: "return consignment",
        build: () =>
          buildReturn(books, {
            id,
            at: AT + index,
            partyId: pair.partyId,
            productId: pair.productId,
            qty,
            unitPricePaisa: 1,
            mode: "consign",
          }),
      };
    }
    case 3: {
      const pairs = books.parties.flatMap((row) =>
        books.products
          .filter((product) => soldQty(books, row.id, product.id) > 0)
          .map((product) => ({ partyId: row.id, productId: product.id })),
      );
      const pair = pick(pairs, 0);
      if (!pair) return null;
      const product = books.products.find((row) => row.id === pair.productId);
      if (!product) return null;
      const qty = 1 + (token % Math.min(soldQty(books, pair.partyId, pair.productId), 3));
      const value = qty * product.pricePaisa;
      const due = balance(books, "receivable", pair.partyId);
      // Generated returns stay on the supported path: a due in credit, or a
      // refund larger than the cash drawer, are documented gaps, not asserted.
      if (due < 0 || value - Math.min(due, value) > balance(books, "cash")) return null;
      return {
        name: "return sale",
        build: () =>
          buildReturn(books, {
            id,
            at: AT + index,
            partyId: pair.partyId,
            productId: pair.productId,
            qty,
            unitPricePaisa: product.pricePaisa,
            mode: "sold",
          }),
      };
    }
    case 4: {
      const owing = books.parties.filter((row) => balance(books, "receivable", row.id) > 0);
      const debtor = pick(owing, 0);
      if (!debtor) return null;
      const due = balance(books, "receivable", debtor.id);
      const amountPaisa = 1 + (token % due);
      return {
        name: "collection",
        build: () =>
          buildCollection(books, { id, at: AT + index, partyId: debtor.id, amountPaisa }),
      };
    }
    case 5: {
      const cash = balance(books, "cash");
      if (cash <= 0) return null;
      const owed = balance(books, "payable", party.id);
      const cap = owed > 0 ? Math.min(owed, cash) : cash;
      const amountPaisa = 1 + (token % cap);
      return {
        name: "payment",
        build: () => buildPayment(books, { id, at: AT + index, partyId: party.id, amountPaisa }),
      };
    }
    case 6: {
      const product = pick(books.products, 0);
      if (!product) return null;
      const qty = 1 + (token % 4);
      const costPaisa = product.costPaisa + (token % 3);
      const total = qty * costPaisa;
      const paidPaisa = [(token >> 4) % 3].map((mode) =>
        mode === 0 ? 0 : mode === 1 ? total : Math.floor(total / 2),
      )[0]!;
      return {
        name: "purchase",
        build: () =>
          buildPurchase(books, {
            id,
            at: AT + index,
            partyId: party.id,
            productId: product.id,
            qty,
            costPaisa,
            paidPaisa,
          }),
      };
    }
    case 7: {
      // Expense is capped at cash so the walk stays on the supported path.
      const cash = balance(books, "cash");
      if (cash <= 0) return null;
      const amountPaisa = 1 + (token % cash);
      return {
        name: "expense",
        build: () => buildExpense(books, { id, at: AT + index, amountPaisa, label: "ভাড়া" }),
      };
    }
    default: {
      const reversible = books.entries.filter(
        (row) => row.kind !== "opening" && row.kind !== "reversal" && !reversalFor(books, row.id),
      );
      const original = pick(reversible, 0);
      if (!original) return null;
      return {
        name: "reversal",
        build: () => buildReversal({ id, at: AT + index, original, reason: "ভুল অঙ্ক" }),
      };
    }
  }
}

interface Walk {
  books: Books;
  applied: { entry: Entry; before: Books; after: Books }[];
  rejected: string[];
}

/** Drive a generated script of operations, asserting after every posting. */
function walk(catalog: Catalog, tokens: number[]): Walk {
  let books = openingBooks(catalog);
  const applied: Walk["applied"] = [];
  const rejected: string[] = [];

  const attempt = (name: string, build: () => Entry) => {
    // A refusal, whether from the builder or from `apply` (which re-checks
    // stock and reversibility), must leave the books untouched.
    const before = books;
    let entry: Entry;
    let next: Books;
    try {
      entry = build();
      next = apply(books, entry);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(books).toBe(before);
      rejected.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    assertStep(before, next, entry);
    books = next;
    applied.push({ entry, before, after: next });
  };

  // First operation is always a credit sale, so every generated script posts at
  // least one entry and the assertions are never vacuous.
  const product = books.products.find((row) => stockAt(books, row.id, WAREHOUSE) > 0);
  if (!product) return { books, applied, rejected };
  attempt("sale", () =>
    buildSale(books, {
      id: "first",
      at: AT,
      partyId: parties[0]!.id,
      productId: product.id,
      qty: 1,
      unitPricePaisa: product.pricePaisa,
      receivedPaisa: 0,
    }),
  );

  tokens.forEach((token, index) => {
    const step = stepFor(books, token, index + 1);
    if (step) attempt(step.name, step.build);
  });
  return { books, applied, rejected };
}

const scriptArb = fc.array(fc.nat({ max: 2 ** 31 - 1 }), { minLength: 1, maxLength: 14 });

describe("ledger invariants over generated operations", () => {
  it("keeps double entry, append-only history, stock and idempotency intact", () => {
    fc.assert(
      fc.property(catalogArb, scriptArb, (catalog, tokens) => {
        const result = walk(catalog, tokens);
        // The opening entry plus the guaranteed first sale are always present,
        // so the assertions above can never pass vacuously.
        expect(result.books.entries.length).toBeGreaterThanOrEqual(2);
        expect(result.applied.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 75 },
    );
  }, 30_000);

  it("exercises every operation kind at least once", () => {
    const catalog: Catalog = {
      cost1: 100,
      price1: 200,
      pack1: 12,
      cost2: 50,
      price2: 90,
      pack2: 6,
      cash: 100_000,
      qty1: 120,
      qty2: 40,
    };
    const { applied, rejected } = walk(catalog, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(rejected).toEqual([]);
    const kinds = new Set(applied.map((row) => row.entry.kind));
    for (const kind of [
      "sale",
      "consign",
      "return",
      "collection",
      "payment",
      "purchase",
      "expense",
      "reversal",
    ] as const) {
      expect(kinds.has(kind), `operation ${kind} never ran`).toBe(true);
    }
    const modes = applied
      .filter((row) => row.entry.kind === "return")
      .map((row) => row.entry.meta.returnMode)
      .sort();
    expect(modes).toEqual(["consign", "sold"]);
  });

  it("restores the exact state before an entry when it is reversed", () => {
    fc.assert(
      fc.property(catalogArb, scriptArb, fc.nat(), (catalog, tokens, choice) => {
        const { applied } = walk(catalog, tokens);
        const reversible = applied.filter(
          (row) => row.entry.kind !== "opening" && row.entry.kind !== "reversal",
        );
        expect(reversible.length).toBeGreaterThan(0);
        const target = reversible[choice % reversible.length]!;
        // The correction is applied to the state that contains the original;
        // its effect must be the state immediately before that original.
        const before = target.before;
        const reversal = buildReversal({
          id: `reversal-${target.entry.id}`,
          at: target.entry.at + 1,
          original: target.entry,
          reason: "পরীক্ষা",
        });
        const restored = apply(target.after, reversal);

        expect(audit(restored).ok).toBe(true);
        for (const account of ACCOUNTS) {
          expect(balance(restored, account)).toBe(balance(before, account));
        }
        for (const party of before.parties) {
          for (const account of ["receivable", "payable"] as const) {
            expect(balance(restored, account, party.id)).toBe(balance(before, account, party.id));
          }
        }
        for (const location of locationsOf(before)) {
          for (const product of before.products) {
            expect(stockAt(restored, product.id, location)).toBe(
              stockAt(before, product.id, location),
            );
          }
        }
        // The correction is a new entry: the original is still on the record.
        expect(restored.entries.some((row) => row.id === target.entry.id)).toBe(true);
        expect(reversalFor(restored, target.entry.id)?.id).toBe(reversal.id);
      }),
      { numRuns: 50 },
    );
  }, 30_000);

  it("mirrors the original exactly and allows only one correction per entry", () => {
    const books = makeSeed(AT);
    const originals = books.entries.filter(
      (row) => row.kind !== "opening" && row.kind !== "reversal",
    );
    expect(originals.length).toBeGreaterThan(0);
    for (const original of originals) {
      const correction = buildReversal({
        id: `fix-${original.id}`,
        at: AT + 1,
        original,
        reason: "ভুল অঙ্ক",
      });
      expect(correction.reversesEntryId).toBe(original.id);
      expect(correction.kind).toBe("reversal");
      expect(correction.meta.reason).toBe("ভুল অঙ্ক");
      expect(correction.summary).toContain(original.summary);
      expect(correction.lines).toHaveLength(original.lines.length);
      correction.lines.forEach((row, index) => {
        const source = original.lines[index]!;
        expect(row.account).toBe(source.account);
        expect(row.partyId).toBe(source.partyId);
        expect(row.debit).toBe(source.credit);
        expect(row.credit).toBe(source.debit);
      });
      expect(correction.stock).toEqual(
        original.stock.map((move) => ({
          productId: move.productId,
          location: move.location,
          qtyDelta: -move.qtyDelta,
        })),
      );

      const corrected = apply(apply(books, original), correction);
      expect(() => apply(corrected, { ...correction, id: `${correction.id}-again` })).toThrow(
        /আগেই বিলোপ/,
      );
      expect(corrected.entries.filter((row) => row.reversesEntryId === original.id)).toHaveLength(
        1,
      );
    }
  });

  it("refuses invalid operations without touching the books", () => {
    const books = makeSeed(AT);
    const snapshot = structuredClone(books);
    const product = books.products[0]!;
    const have = stockAt(books, product.id, WAREHOUSE);
    const party = books.parties[1]!;
    const cash = balance(books, "cash");
    expect(have).toBeGreaterThan(1);
    expect(cash).toBeGreaterThan(1);

    const invalid: { name: string; build: () => Entry }[] = [
      {
        name: "sell more than the warehouse holds",
        build: () =>
          buildSale(books, {
            id: "bad-stock",
            at: AT,
            partyId: party.id,
            productId: product.id,
            qty: have + 1,
            unitPricePaisa: 10,
            receivedPaisa: 0,
          }),
      },
      {
        name: "sell at a zero price",
        build: () =>
          buildSale(books, {
            id: "bad-price",
            at: AT,
            partyId: party.id,
            productId: product.id,
            qty: 1,
            unitPricePaisa: 0,
            receivedPaisa: 0,
          }),
      },
      {
        name: "take more cash than the sale total",
        build: () =>
          buildSale(books, {
            id: "bad-cash",
            at: AT,
            partyId: party.id,
            productId: product.id,
            qty: 1,
            unitPricePaisa: 100,
            receivedPaisa: 101,
          }),
      },
      {
        name: "sell a product that does not exist",
        build: () =>
          buildSale(books, {
            id: "bad-product",
            at: AT,
            partyId: party.id,
            productId: "missing",
            qty: 1,
            unitPricePaisa: 10,
            receivedPaisa: 0,
          }),
      },
      {
        name: "collect more than the due",
        build: () =>
          buildCollection(books, {
            id: "bad-due",
            at: AT,
            partyId: "karim",
            amountPaisa: balance(books, "receivable", "karim") + 1,
          }),
      },
      {
        name: "collect from a shop with no due",
        build: () =>
          buildCollection(books, { id: "bad-empty", at: AT, partyId: "kamal", amountPaisa: 1 }),
      },
      {
        name: "pay more cash than the drawer holds",
        build: () => buildPayment(books, { id: "bad-pay", at: AT, amountPaisa: cash + 1 }),
      },
      {
        name: "pay zero",
        build: () => buildPayment(books, { id: "bad-zero-pay", at: AT, amountPaisa: 0 }),
      },
      {
        name: "leave more stock than exists",
        build: () =>
          buildConsign(books, {
            id: "bad-consign",
            at: AT,
            partyId: party.id,
            productId: product.id,
            qty: have + 1,
          }),
      },
      {
        name: "leave zero stock",
        build: () =>
          buildConsign(books, {
            id: "bad-consign-zero",
            at: AT,
            partyId: party.id,
            productId: product.id,
            qty: 0,
          }),
      },
      {
        name: "take back consignment that was never left",
        build: () =>
          buildReturn(books, {
            id: "bad-return-consign",
            at: AT,
            partyId: "salma",
            productId: product.id,
            qty: 1,
            unitPricePaisa: 1,
            mode: "consign",
          }),
      },
      {
        name: "return more than was sold",
        build: () =>
          buildReturn(books, {
            id: "bad-return-sold",
            at: AT,
            partyId: "salma",
            productId: product.id,
            qty: 1000,
            unitPricePaisa: 1,
            mode: "sold",
          }),
      },
      {
        name: "pay a supplier more than the purchase total",
        build: () =>
          buildPurchase(books, {
            id: "bad-purchase",
            at: AT,
            partyId: "kamal",
            productId: product.id,
            qty: 1,
            costPaisa: 100,
            paidPaisa: 101,
          }),
      },
      {
        name: "spend zero",
        build: () => buildExpense(books, { id: "bad-expense", at: AT, amountPaisa: 0, label: "x" }),
      },
    ];

    for (const attempt of invalid) {
      expect(attempt.build, attempt.name).toThrow();
      expect(books, attempt.name).toEqual(snapshot);
    }

    // `apply` refuses corrections it cannot link to a reversible entry, and the
    // opening balance can never be corrected (it is the starting state).
    expect(() =>
      apply(
        books,
        buildReversal({ id: "bad-opening", at: AT, original: books.entries[0]!, reason: "x" }),
      ),
    ).toThrow(/বিলোপ/);
    const sale = books.entries.find((row) => row.kind === "sale")!;
    const correction = buildReversal({ id: "ok", at: AT, original: sale, reason: "x" });
    expect(() => apply(books, { ...correction, reversesEntryId: "missing" })).toThrow();
    const once = apply(apply(books, sale), correction);
    expect(() => apply(once, { ...correction, id: "second" })).toThrow(/আগেই বিলোপ/);
    expect(() =>
      apply(once, buildReversal({ id: "flip", at: AT, original: correction, reason: "x" })),
    ).toThrow();
  });
});
