import { formatQty, formatTaka } from "./money.ts";
import {
  WAREHOUSE,
  partyLoc,
  type Account,
  type Books,
  type Entry,
  type EntryMeta,
  type JournalLine,
  type Product,
  type StockMove,
} from "./types.ts";

export class BooksError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BooksError";
  }
}

const CREDIT_NORMAL = new Set<Account>(["revenue", "payable", "capital"]);

export function balance(books: Books, account: Account, partyId?: string): number {
  let debit = 0;
  let credit = 0;
  for (const entry of books.entries) {
    for (const line of entry.lines) {
      if (line.account !== account) continue;
      if (partyId && line.partyId !== partyId) continue;
      debit += line.debit;
      credit += line.credit;
    }
  }
  return CREDIT_NORMAL.has(account) ? credit - debit : debit - credit;
}

export function stockAt(books: Books, productId: string, location: string): number {
  let qty = 0;
  for (const entry of books.entries) {
    for (const move of entry.stock) {
      if (move.productId === productId && move.location === location) qty += move.qtyDelta;
    }
  }
  return qty;
}

export function stockTotal(books: Books, productId: string): number {
  let qty = 0;
  for (const entry of books.entries) {
    for (const move of entry.stock) {
      if (move.productId === productId) qty += move.qtyDelta;
    }
  }
  return qty;
}

export function partyById(books: Books, id?: string) {
  return books.parties.find((party) => party.id === id);
}

export function productById(books: Books, id?: string) {
  return books.products.find((product) => product.id === id);
}

export interface Explained {
  title: string;
  rows: { k: string; v: string }[];
  foot?: string;
}

export function explain(books: Books, entry: Entry): Explained {
  const party = partyById(books, entry.partyId);
  const product = productById(books, entry.productId);
  const who = party?.name;
  const qty =
    product && entry.meta.qty != null
      ? formatQty(entry.meta.qty, entry.meta.packSize ?? product.packSize, product.packName)
      : undefined;
  const rows: { k: string; v: string }[] = [];
  const add = (k: string, v?: string) => {
    if (v) rows.push({ k, v });
  };

  switch (entry.kind) {
    case "opening":
      return {
        title: "শুরুর হিসাব",
        rows: [
          { k: "নগদ", v: formatTaka(cashOf(entry)) },
          { k: "মাল", v: "গুদামে ঢোকানো হয়েছে" },
        ],
        foot: "বিক্রি নয়। আগের মাল আর টাকা বসানো।",
      };
    case "sale":
      add("দোকান", who);
      add("মাল", product?.name);
      add("পরিমাণ", qty);
      add("মোট বিক্রি", formatTaka(entry.meta.total ?? 0));
      add("টাকা পেয়েছি", formatTaka(entry.meta.received ?? 0));
      add("নতুন বাকি", formatTaka((entry.meta.total ?? 0) - (entry.meta.received ?? 0)));
      return {
        title: entry.meta.fromConsignment ? "রাখা মাল বিক্রি" : "বিক্রি",
        rows,
        foot: entry.meta.fromConsignment
          ? "দোকানে রাখা মাল থেকে বিক্রি হয়েছে। এখন বিক্রি ধরা হলো।"
          : undefined,
      };
    case "collection":
      add("দোকান", who);
      add("টাকা পেয়েছি", formatTaka(entry.meta.received ?? 0));
      add("পাওনা কমেছে", formatTaka(entry.meta.received ?? 0));
      return {
        title: "পুরনো বাকি আদায়",
        rows,
        foot: "নতুন বিক্রি নয়। শুধু আগের পাওনা কমেছে।",
      };
    case "payment":
      add("কাকে", who);
      add("টাকা দিয়েছি", formatTaka(entry.meta.total ?? 0));
      if (entry.meta.label === "দেনা শোধ") add("দেনা কমেছে", formatTaka(entry.meta.total ?? 0));
      if (entry.meta.label === "পাওনা বাড়বে") add("পাওনা বেড়েছে", formatTaka(entry.meta.total ?? 0));
      return {
        title: "টাকা দিয়েছি",
        rows,
        foot:
          entry.meta.label === "দেনা শোধ"
            ? "এটা টাকা পাওয়া নয়। আগের দেনা শোধ।"
            : entry.meta.label === "পাওনা বাড়বে"
              ? "টাকা বেরিয়েছে। ওনার কাছে এই টাকা পাওনা থাকবে।"
              : "নগদ কমেছে। বিক্রি বাড়েনি।",
      };
    case "consign":
      add("দোকান", who);
      add("মাল", product?.name);
      add("পরিমাণ", qty);
      return {
        title: "দোকানে মাল রাখা",
        rows,
        foot: "এটা বিক্রি নয়। মাল এখনও আপনার। পাওনা বাড়েনি।",
      };
    case "return":
      add("দোকান", who);
      add("মাল", product?.name);
      add("পরিমাণ", qty);
      if (entry.meta.returnMode === "consign") {
        return {
          title: "রাখা মাল ফেরত",
          rows,
          foot: "বিক্রি কমেনি। মাল আবার গুদামে।",
        };
      }
      add("বিক্রি কমেছে", formatTaka(entry.meta.total ?? 0));
      if ((entry.meta.refund ?? 0) > 0) add("টাকা ফেরত", formatTaka(entry.meta.refund ?? 0));
      return { title: "বিক্রি ফেরত", rows, foot: entry.meta.label };
    case "purchase":
      add("কার কাছ থেকে", who ?? "নগদ কেনা");
      add("মাল", product?.name);
      add("পরিমাণ", qty);
      add("মোট কেনা", formatTaka(entry.meta.total ?? 0));
      add("দিয়েছি", formatTaka(entry.meta.received ?? 0));
      add("বাকি দেনা", formatTaka((entry.meta.total ?? 0) - (entry.meta.received ?? 0)));
      return { title: "মাল এনেছি", rows };
    case "expense":
      add("খাতা", entry.meta.label);
      add("খরচ", formatTaka(entry.meta.total ?? 0));
      return { title: "খরচ", rows };
    case "reversal":
      add("মূল হিসাব", entry.summary);
      if (entry.meta.reason) add("কারণ", entry.meta.reason);
      return { title: "হিসাব বিলোপ", rows };
    default:
      return { title: "হিসাব", rows: [] };
  }
}

function cashOf(entry: Entry): number {
  return entry.lines
    .filter((line) => line.account === "cash")
    .reduce((sum, line) => sum + line.debit - line.credit, 0);
}

function finish(entry: Entry): Entry {
  let debit = 0;
  let credit = 0;
  for (const line of entry.lines) {
    if (!Number.isInteger(line.debit) || !Number.isInteger(line.credit)) {
      throw new BooksError("হিসাবের অঙ্ক পূর্ণসংখ্যা নয়। সেভ হয়নি।");
    }
    if (line.debit < 0 || line.credit < 0 || (line.debit > 0 && line.credit > 0)) {
      throw new BooksError("হিসাবের লাইন ঠিক নেই। সেভ হয়নি।");
    }
    debit += line.debit;
    credit += line.credit;
  }
  if (debit !== credit) throw new BooksError("হিসাবের দুই দিক মেলেনি। সেভ হয়নি।");
  for (const move of entry.stock) {
    if (!Number.isInteger(move.qtyDelta) || move.qtyDelta === 0) {
      throw new BooksError("মালের সংখ্যা ঠিক নেই। সেভ হয়নি।");
    }
  }
  return entry;
}

function mustParty(books: Books, partyId?: string) {
  const party = partyById(books, partyId);
  if (!party) throw new BooksError("দোকান বেছে নিন।");
  return party;
}

function mustProduct(books: Books, productId?: string) {
  const product = productById(books, productId);
  if (!product) throw new BooksError("মাল বেছে নিন।");
  return product;
}

function line(account: Account, debit: number, credit: number, partyId?: string): JournalLine {
  const row: JournalLine = { account, debit, credit };
  if (partyId) row.partyId = partyId;
  return row;
}

export function apply(books: Books, entry: Entry): Books {
  if (books.entries.some((existing) => existing.id === entry.id)) return books;
  finish(entry);
  for (const move of entry.stock) {
    if (move.qtyDelta < 0) {
      const have = stockAt(books, move.productId, move.location);
      if (have + move.qtyDelta < 0) {
        throw new BooksError("মাল আর নেই। হিসাব সেভ হয়নি।");
      }
    }
  }
  if (entry.kind === "collection" && entry.partyId) {
    const due = balance(books, "receivable", entry.partyId);
    if ((entry.meta.received ?? 0) > due) {
      throw new BooksError("পাওনা এর মধ্যে কমে গেছে। আবার দেখুন।");
    }
  }
  if (entry.kind === "payment") {
    const given = entry.meta.total ?? 0;
    if (given > balance(books, "cash")) throw new BooksError("নগদ এর মধ্যে কমে গেছে। আবার দেখুন।");
    if (entry.partyId && entry.meta.label === "দেনা শোধ") {
      const owed = balance(books, "payable", entry.partyId);
      if (given > owed) throw new BooksError("দেনা এর মধ্যে কমে গেছে। আবার দেখুন।");
    }
  }
  let products = books.products;
  if (entry.costUpdate) {
    products = products.map((product) =>
      product.id === entry.costUpdate?.productId
        ? { ...product, costPaisa: entry.costUpdate.costPaisa }
        : product,
    );
  }
  if (entry.priceUpdate) {
    products = products.map((product) =>
      product.id === entry.priceUpdate?.productId
        ? { ...product, pricePaisa: entry.priceUpdate.pricePaisa }
        : product,
    );
  }
  return { ...books, products, entries: [...books.entries, entry] };
}

export function audit(books: Books): { ok: boolean; debit: number; credit: number } {
  let debit = 0;
  let credit = 0;
  for (const entry of books.entries) {
    try {
      finish(entry);
    } catch {
      return { ok: false, debit, credit };
    }
    for (const row of entry.lines) {
      debit += row.debit;
      credit += row.credit;
    }
  }
  const locations = new Set<string>();
  for (const entry of books.entries) {
    for (const move of entry.stock) locations.add(`${move.productId}:${move.location}`);
  }
  for (const key of locations) {
    const split = key.indexOf(":");
    const productId = key.slice(0, split);
    const location = key.slice(split + 1);
    if (stockAt(books, productId, location) < 0) return { ok: false, debit, credit };
  }
  return { ok: debit === credit, debit, credit };
}

export function buildReversal(input: {
  id: string;
  at: number;
  original: Entry;
  reason: string;
}): Entry {
  const lines: JournalLine[] = input.original.lines.map((row) => ({
    account: row.account,
    partyId: row.partyId,
    debit: row.credit,
    credit: row.debit,
  }));
  const stock: StockMove[] = input.original.stock.map((move) => ({
    productId: move.productId,
    location: move.location,
    qtyDelta: -move.qtyDelta,
  }));
  return finish({
    id: input.id,
    kind: "reversal",
    at: input.at,
    partyId: input.original.partyId,
    productId: input.original.productId,
    summary: `বিলোপ · ${input.original.summary} · "${input.reason}"`,
    lines,
    stock,
    meta: { ...input.original.meta, reason: input.reason },
    reversesEntryId: input.original.id,
  });
}

export function buildOpening(input: {
  id: string;
  at: number;
  cashPaisa: number;
  stock: { productId: string; qty: number; costPaisa: number }[];
  products: Product[];
}): Entry {
  let inventory = 0;
  const stock: StockMove[] = [];
  for (const row of input.stock) {
    if (!Number.isInteger(row.qty) || row.qty < 0) throw new BooksError("শুরুর মালের সংখ্যা ঠিক নয়।");
    inventory += row.qty * row.costPaisa;
    if (row.qty > 0) stock.push({ productId: row.productId, location: WAREHOUSE, qtyDelta: row.qty });
  }
  const names = input.stock
    .filter((row) => row.qty > 0)
    .map((row) => input.products.find((product) => product.id === row.productId)?.name ?? "মাল")
    .join(", ");
  return finish({
    id: input.id,
    kind: "opening",
    at: input.at,
    summary: `শুরুর হিসাব · ${names}`,
    lines: [
      line("inventory", inventory, 0),
      line("cash", input.cashPaisa, 0),
      line("capital", 0, inventory + input.cashPaisa),
    ],
    stock,
    meta: { total: input.cashPaisa },
  });
}

export function buildSale(
  books: Books,
  input: {
    id: string;
    at: number;
    partyId?: string;
    productId?: string;
    qty?: number;
    unitPricePaisa?: number;
    totalPaisa?: number;
    receivedPaisa: number;
    fromConsignment?: boolean;
  },
): Entry {
  if (!Number.isInteger(input.receivedPaisa) || input.receivedPaisa < 0) {
    throw new BooksError("পাওয়া টাকা ঠিক নয়।");
  }
  if (input.productId) {
    const product = mustProduct(books, input.productId);
    const qty = input.qty ?? 0;
    const price = input.unitPricePaisa ?? product.pricePaisa;
    if (!Number.isInteger(qty) || qty <= 0) throw new BooksError("কয়টা মাল, সেটা বলুন।");
    if (!Number.isInteger(price) || price <= 0) throw new BooksError("প্রতি পিসের দাম বলুন।");
    const total = qty * price;
    if (input.receivedPaisa > total) throw new BooksError("মোট বিক্রির চেয়ে বেশি টাকা পেয়েছেন। ঠিক করুন।");
    const due = total - input.receivedPaisa;
    const party = due > 0 ? mustParty(books, input.partyId) : partyById(books, input.partyId);
    const location = input.fromConsignment ? partyLoc(mustParty(books, input.partyId).id) : WAREHOUSE;
    const have = stockAt(books, product.id, location);
    if (have < qty) {
      const where = input.fromConsignment ? "দোকানে রাখা আছে" : "গুদামে আছে";
      throw new BooksError(
        `${where} ${formatQty(have, product.packSize, product.packName)}। ${formatQty(qty, product.packSize, product.packName)} বিক্রি হবে না।`,
      );
    }
    const cost = qty * product.costPaisa;
    const lines: JournalLine[] = [];
    if (input.receivedPaisa > 0) lines.push(line("cash", input.receivedPaisa, 0));
    if (due > 0 && party) lines.push(line("receivable", due, 0, party.id));
    lines.push(line("revenue", 0, total));
    if (cost > 0) {
      lines.push(line("cogs", cost, 0));
      lines.push(line("inventory", 0, cost));
    }
    const who = party ? `${party.name} · ` : "নগদ · ";
    return finish({
      id: input.id,
      kind: "sale",
      at: input.at,
      partyId: party?.id,
      productId: product.id,
      summary: `${who}${product.name} · ${formatQty(qty, product.packSize, product.packName)} · ${formatTaka(total)}`,
      lines,
      stock: [{ productId: product.id, location, qtyDelta: -qty }],
      meta: {
        qty,
        unitPrice: price,
        total,
        received: input.receivedPaisa,
        fromConsignment: Boolean(input.fromConsignment),
        packSize: product.packSize,
      },
      priceUpdate:
        price !== product.pricePaisa ? { productId: product.id, pricePaisa: price } : undefined,
    });
  }

  const total = input.totalPaisa ?? 0;
  if (!Number.isInteger(total) || total <= 0) throw new BooksError("বিক্রির টাকা বলুন।");
  if (input.receivedPaisa > total) throw new BooksError("মোট বিক্রির চেয়ে বেশি টাকা পেয়েছেন। ঠিক করুন।");
  const due = total - input.receivedPaisa;
  const party = due > 0 ? mustParty(books, input.partyId) : partyById(books, input.partyId);
  const lines: JournalLine[] = [];
  if (input.receivedPaisa > 0) lines.push(line("cash", input.receivedPaisa, 0));
  if (due > 0 && party) lines.push(line("receivable", due, 0, party.id));
  lines.push(line("revenue", 0, total));
  return finish({
    id: input.id,
    kind: "sale",
    at: input.at,
    partyId: party?.id,
    summary: `${party ? `${party.name} · ` : "নগদ · "}বিক্রি ${formatTaka(total)}`,
    lines,
    stock: [],
    meta: { total, received: input.receivedPaisa },
  });
}

export function buildCollection(
  books: Books,
  input: { id: string; at: number; partyId: string; amountPaisa: number },
): Entry {
  const party = mustParty(books, input.partyId);
  if (!Number.isInteger(input.amountPaisa) || input.amountPaisa <= 0) {
    throw new BooksError("কত টাকা পেয়েছেন, সেটা বলুন।");
  }
  const due = balance(books, "receivable", party.id);
  if (due <= 0) throw new BooksError(`${party.name}-এর পাওনা নেই।`);
  if (input.amountPaisa > due) {
    throw new BooksError(`পাওনা ${formatTaka(due)}। তার বেশি আদায় হবে না।`);
  }
  return finish({
    id: input.id,
    kind: "collection",
    at: input.at,
    partyId: party.id,
    summary: `${party.name} · আদায় ${formatTaka(input.amountPaisa)}`,
    lines: [line("cash", input.amountPaisa, 0), line("receivable", 0, input.amountPaisa, party.id)],
    stock: [],
    meta: { received: input.amountPaisa, total: input.amountPaisa },
  });
}

export function buildPayment(
  books: Books,
  input: { id: string; at: number; partyId?: string; amountPaisa: number },
): Entry {
  if (!Number.isInteger(input.amountPaisa) || input.amountPaisa <= 0) {
    throw new BooksError("কত টাকা দিয়েছেন, সেটা বলুন।");
  }
  const cash = balance(books, "cash");
  if (input.amountPaisa > cash) {
    throw new BooksError(`নগদে আছে ${formatTaka(cash)}। তার বেশি দেওয়া হবে না।`);
  }
  const party = input.partyId ? mustParty(books, input.partyId) : undefined;
  const owed = party ? balance(books, "payable", party.id) : 0;
  if (party && owed > 0 && input.amountPaisa > owed) {
    throw new BooksError(`দেনা ${formatTaka(owed)}। তার বেশি দেওয়া হবে না।`);
  }
  const settle = Boolean(party && owed >= input.amountPaisa && owed > 0);
  const label = !party ? "টাকা দিয়েছি" : settle ? "দেনা শোধ" : "পাওনা বাড়বে";
  const lines: JournalLine[] = [line("cash", 0, input.amountPaisa)];
  if (settle && party) lines.unshift(line("payable", input.amountPaisa, 0, party.id));
  else if (party) lines.unshift(line("receivable", input.amountPaisa, 0, party.id));
  else lines.unshift(line("expense", input.amountPaisa, 0));
  return finish({
    id: input.id,
    kind: "payment",
    at: input.at,
    partyId: party?.id,
    summary: `${party ? `${party.name} · ` : ""}টাকা দিয়েছি ${formatTaka(input.amountPaisa)}`,
    lines,
    stock: [],
    meta: { total: input.amountPaisa, received: 0, label },
  });
}

export function buildConsign(
  books: Books,
  input: { id: string; at: number; partyId: string; productId: string; qty: number },
): Entry {
  const party = mustParty(books, input.partyId);
  const product = mustProduct(books, input.productId);
  if (!Number.isInteger(input.qty) || input.qty <= 0) throw new BooksError("কয়টা মাল রাখবেন, সেটা বলুন।");
  const have = stockAt(books, product.id, WAREHOUSE);
  if (have < input.qty) {
    throw new BooksError(
      `গুদামে আছে ${formatQty(have, product.packSize, product.packName)}। অত মাল রাখা যাবে না।`,
    );
  }
  return finish({
    id: input.id,
    kind: "consign",
    at: input.at,
    partyId: party.id,
    productId: product.id,
    summary: `${party.name} · রাখা মাল ${product.name} · ${formatQty(input.qty, product.packSize, product.packName)}`,
    lines: [],
    stock: [
      { productId: product.id, location: WAREHOUSE, qtyDelta: -input.qty },
      { productId: product.id, location: partyLoc(party.id), qtyDelta: input.qty },
    ],
    meta: { qty: input.qty, packSize: product.packSize, total: 0, received: 0 },
  });
}

function netSold(books: Books, partyId: string, productId: string): number {
  let qty = 0;
  for (const entry of books.entries) {
    if (entry.partyId !== partyId || entry.productId !== productId) continue;
    if (entry.kind === "sale") qty += entry.meta.qty ?? 0;
    if (entry.kind === "return" && entry.meta.returnMode === "sold") qty -= entry.meta.qty ?? 0;
  }
  return qty;
}

export function buildReturn(
  books: Books,
  input: {
    id: string;
    at: number;
    partyId: string;
    productId: string;
    qty: number;
    unitPricePaisa: number;
    mode: "sold" | "consign";
    reason?: string;
  },
): Entry {
  const party = mustParty(books, input.partyId);
  const product = mustProduct(books, input.productId);
  if (!Number.isInteger(input.qty) || input.qty <= 0) throw new BooksError("কয়টা ফেরত, সেটা বলুন।");
  if (input.mode === "consign") {
    const have = stockAt(books, product.id, partyLoc(party.id));
    if (have < input.qty) {
      throw new BooksError(
        `দোকানে রাখা আছে ${formatQty(have, product.packSize, product.packName)}। অত ফেরত আসবে না।`,
      );
    }
    return finish({
      id: input.id,
      kind: "return",
      at: input.at,
      partyId: party.id,
      productId: product.id,
      summary: `${party.name} · রাখা মাল ফেরত · ${product.name}`,
      lines: [],
      stock: [
        { productId: product.id, location: partyLoc(party.id), qtyDelta: -input.qty },
        { productId: product.id, location: WAREHOUSE, qtyDelta: input.qty },
      ],
      meta: {
        qty: input.qty,
        packSize: product.packSize,
        returnMode: "consign",
        total: 0,
        label: input.reason,
      },
    });
  }
  const sold = netSold(books, party.id, product.id);
  if (input.qty > sold) {
    throw new BooksError(
      `${party.name}-এ ${formatQty(Math.max(sold, 0), product.packSize, product.packName)} বিক্রি হয়েছে। তার বেশি ফেরত নয়।`,
    );
  }
  if (!Number.isInteger(input.unitPricePaisa) || input.unitPricePaisa <= 0) {
    throw new BooksError("ফেরতের দাম বলুন।");
  }
  const value = input.qty * input.unitPricePaisa;
  const cost = input.qty * product.costPaisa;
  const due = balance(books, "receivable", party.id);
  const creditReceivable = Math.min(due, value);
  const refund = value - creditReceivable;
  const lines: JournalLine[] = [line("revenue", value, 0)];
  if (creditReceivable > 0) lines.push(line("receivable", 0, creditReceivable, party.id));
  if (refund > 0) lines.push(line("cash", 0, refund));
  if (cost > 0) {
    lines.push(line("inventory", cost, 0));
    lines.push(line("cogs", 0, cost));
  }
  return finish({
    id: input.id,
    kind: "return",
    at: input.at,
    partyId: party.id,
    productId: product.id,
    summary: `${party.name} · ফেরত ${product.name} · ${formatQty(input.qty, product.packSize, product.packName)}`,
    lines,
    stock: [{ productId: product.id, location: WAREHOUSE, qtyDelta: input.qty }],
    meta: {
      qty: input.qty,
      unitPrice: input.unitPricePaisa,
      total: value,
      refund,
      packSize: product.packSize,
      returnMode: "sold",
      label: input.reason,
    },
  });
}

export function buildPurchase(
  books: Books,
  input: {
    id: string;
    at: number;
    partyId?: string;
    productId: string;
    qty: number;
    costPaisa: number;
    paidPaisa: number;
  },
): Entry {
  const product = mustProduct(books, input.productId);
  if (!Number.isInteger(input.qty) || input.qty <= 0) throw new BooksError("কয়টা মাল এনেছেন, সেটা বলুন।");
  if (!Number.isInteger(input.costPaisa) || input.costPaisa <= 0) throw new BooksError("কেনা দাম বলুন।");
  if (!Number.isInteger(input.paidPaisa) || input.paidPaisa < 0) throw new BooksError("কত দিয়েছেন, সেটা বলুন।");
  const total = input.qty * input.costPaisa;
  if (input.paidPaisa > total) throw new BooksError("মোট কেনার চেয়ে বেশি দেওয়া হয়েছে।");
  const payable = total - input.paidPaisa;
  const party = payable > 0 ? mustParty(books, input.partyId) : partyById(books, input.partyId);
  const lines: JournalLine[] = [line("inventory", total, 0)];
  if (input.paidPaisa > 0) lines.push(line("cash", 0, input.paidPaisa));
  if (payable > 0 && party) lines.push(line("payable", 0, payable, party.id));
  const owned = stockTotal(books, product.id);
  const avg = Math.round((owned * product.costPaisa + input.qty * input.costPaisa) / (owned + input.qty));
  return finish({
    id: input.id,
    kind: "purchase",
    at: input.at,
    partyId: party?.id,
    productId: product.id,
    summary: `${product.name} কেনা · ${formatQty(input.qty, product.packSize, product.packName)} · ${formatTaka(total)}`,
    lines,
    stock: [{ productId: product.id, location: WAREHOUSE, qtyDelta: input.qty }],
    meta: {
      qty: input.qty,
      unitPrice: input.costPaisa,
      total,
      received: input.paidPaisa,
      packSize: product.packSize,
    },
    costUpdate: { productId: product.id, costPaisa: avg },
  });
}

export function buildExpense(
  books: Books,
  input: { id: string; at: number; amountPaisa: number; label: string },
): Entry {
  if (!Number.isInteger(input.amountPaisa) || input.amountPaisa <= 0) {
    throw new BooksError("খরচের টাকা বলুন।");
  }
  const label = input.label.trim() || "অন্যান্য";
  void books;
  return finish({
    id: input.id,
    kind: "expense",
    at: input.at,
    summary: `${label} · ${formatTaka(input.amountPaisa)}`,
    lines: [line("expense", input.amountPaisa, 0), line("cash", 0, input.amountPaisa)],
    stock: [],
    meta: { total: input.amountPaisa, label },
  });
}

export function buildStockAdd(
  books: Books,
  input: { id: string; at: number; productId: string; qty: number; costPaisa: number },
): Entry {
  const product = mustProduct(books, input.productId);
  if (!Number.isInteger(input.qty) || input.qty <= 0) throw new BooksError("কয়টা মাল, সেটা বলুন।");
  const value = input.qty * input.costPaisa;
  return finish({
    id: input.id,
    kind: "opening",
    at: input.at,
    productId: product.id,
    summary: `নতুন মাল · ${product.name} · ${formatQty(input.qty, product.packSize, product.packName)}`,
    lines: [line("inventory", value, 0), line("capital", 0, value)],
    stock: [{ productId: product.id, location: WAREHOUSE, qtyDelta: input.qty }],
    meta: { qty: input.qty, total: value, packSize: product.packSize },
  });
}

export function revenueBetween(books: Books, start: number, end: number): number {
  let credit = 0;
  let debit = 0;
  for (const entry of books.entries) {
    if (entry.at < start || entry.at >= end) continue;
    for (const row of entry.lines) {
      if (row.account !== "revenue") continue;
      credit += row.credit;
      debit += row.debit;
    }
  }
  return credit - debit;
}

export function collectedBetween(books: Books, start: number, end: number): number {
  let total = 0;
  for (const entry of books.entries) {
    if (entry.at < start || entry.at >= end) continue;
    if (entry.kind === "sale" || entry.kind === "collection") total += entry.meta.received ?? 0;
    if (entry.kind === "return") total -= entry.meta.refund ?? 0;
  }
  return total;
}

export function productsAt(books: Books, location: string): { product: Product; qty: number }[] {
  return books.products
    .map((product) => ({ product, qty: stockAt(books, product.id, location) }))
    .filter((row) => row.qty > 0);
}

export function metaOf(entry: Entry): EntryMeta {
  return entry.meta;
}
