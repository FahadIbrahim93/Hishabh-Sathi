import { z } from "zod";
import { audit, BooksError } from "./engine.ts";
import { partyLoc, WAREHOUSE, type Books } from "./types.ts";

const id = z.string().min(1);
const count = z.int().nonnegative();
const party = z.object({
  id, name: z.string(), aliases: z.array(z.string()), role: z.enum(["customer", "supplier"]),
  phone: z.string().optional(), archived: z.boolean().optional(),
});
const product = z.object({
  id, name: z.string(), aliases: z.array(z.string()), packName: z.string(),
  packSize: z.int().positive(), pricePaisa: count, costPaisa: count, archived: z.boolean().optional(),
});
const entry = z.object({
  id, at: z.int(), summary: z.string(),
  kind: z.enum(["opening", "sale", "collection", "payment", "consign", "return", "purchase", "expense", "reversal"]),
  partyId: id.optional(), productId: id.optional(), reversesEntryId: id.optional(),
  costUpdate: z.object({ productId: id, costPaisa: count }).optional(),
  priceUpdate: z.object({ productId: id, pricePaisa: count }).optional(),
  lines: z.array(z.object({
    account: z.enum(["cash", "revenue", "cogs", "inventory", "receivable", "payable", "expense", "capital"]),
    partyId: id.optional(), debit: count, credit: count,
  })),
  stock: z.array(z.object({ productId: id, location: id, qtyDelta: z.int() })),
  meta: z.object({
    qty: count.optional(), unitPrice: count.optional(), total: count.optional(),
    received: count.optional(), refund: count.optional(), packSize: z.int().positive().optional(),
    label: z.string().optional(), reason: z.string().optional(),
    returnMode: z.enum(["sold", "consign"]).optional(), fromConsignment: z.boolean().optional(),
  }),
});
const backup = z.object({
  version: z.literal(1), businessName: z.string(), mode: z.enum(["khata", "stock"]),
  parties: z.array(party), products: z.array(product), entries: z.array(entry),
});

function uniqueIds(rows: { id: string }[]): Set<string> {
  const ids = new Set(rows.map(row => row.id));
  if (ids.size !== rows.length) throw new BooksError("ব্যাকআপে একই পরিচয় একাধিকবার আছে।");
  return ids;
}

function checkReferences(books: Books) {
  const parties = uniqueIds(books.parties);
  const products = uniqueIds(books.products);
  const locations = new Set([WAREHOUSE, ...Array.from(parties, partyLoc)]);
  const seen = new Set<string>();

  for (const row of books.entries) {
    if (seen.has(row.id)) throw new BooksError("ব্যাকআপে একই হিসাব একাধিকবার আছে।");
    const missingParty = row.partyId !== undefined && !parties.has(row.partyId);
    const missingProduct = [row.productId, row.costUpdate?.productId, row.priceUpdate?.productId]
      .some(productId => productId !== undefined && !products.has(productId));
    const badLine = row.lines.some(line => line.partyId !== undefined && !parties.has(line.partyId));
    const badMove = row.stock.some(move => !products.has(move.productId) || !locations.has(move.location));
    const badReversal = row.kind === "reversal"
      ? !row.reversesEntryId || !seen.has(row.reversesEntryId)
      : row.reversesEntryId !== undefined;
    if (missingParty || missingProduct || badLine || badMove || badReversal) {
      throw new BooksError("ব্যাকআপের হিসাবের সঙ্গে দোকান, পণ্য বা আগের হিসাবের মিল নেই।");
    }
    if (row.lines.length === 0 && row.stock.length === 0) {
      throw new BooksError("ব্যাকআপে খালি হিসাব আছে।");
    }
    seen.add(row.id);
  }
}

export function parseBackup(json: string): Books {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new BooksError("ব্যাকআপ ফাইলটি পড়া যায়নি।");
  }
  const parsed = backup.safeParse(raw);
  if (!parsed.success) throw new BooksError("ব্যাকআপের গঠন বা সংস্করণ ঠিক নেই।");
  checkReferences(parsed.data);
  const result = audit(parsed.data);
  if (!result.ok || !Number.isSafeInteger(result.debit) || !Number.isSafeInteger(result.credit)) {
    throw new BooksError("ব্যাকআপের হিসাব বা মালের পরিমাণ মেলেনি।");
  }
  // Keep additional v1 export fields intact after checking all fields the app consumes.
  return raw as Books;
}
