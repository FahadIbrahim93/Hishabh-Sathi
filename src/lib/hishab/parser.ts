import { normalizeText, scanAmounts } from "./money.ts";
import type { Books, Draft, FlowKind, Party, Product } from "./types.ts";

export const SAMPLES = {
  sale: "রহিম স্টোরে দুই কেস লাইটার বিক্রি করেছি। প্রতি পিস দশ টাকা। ছয়শ টাকা পেয়েছি।",
  collect: "করিমের কাছ থেকে পাঁচশ টাকা পেয়েছি",
  consign: "নুরের দোকানে এক কেস লাইটার রেখে এসেছি",
} as const;

export interface ParseResult {
  kind: FlowKind | null;
  partyId?: string;
  productId?: string;
  qtyInput?: number;
  unit?: "pack" | "pcs";
  unitPriceTaka?: number;
  receivedTaka?: number;
  receivedKnown?: boolean;
  paidTaka?: number;
  paidKnown?: boolean;
  amountTaka?: number;
  costTaka?: number;
  expenseLabel?: string;
  fromConsignment?: boolean;
  returnMode?: "sold" | "consign";
  payFull?: boolean;
  notes: string[];
}

const PACK_UNIT = /কেস|কেইস|প্যাকেট|কার্টুন|বস্তা/;
const RECEIVED = /পেয়েছি|পেয়েছি|পেলাম|পেরেছি|পাইছি|আদায়|আদায়/;
const PAID = /দিয়েছি|দিয়েছি|দিছি/;

export function parseUtterance(input: string, books: Books): ParseResult {
  const text = normalizeText(input);
  const notes: string[] = [];
  if (!text) {
    return { kind: null, notes: ["কী হয়েছে, এক লাইনে বলুন।"] };
  }

  const sale = /বিক্রি/.test(text);
  const consign = /রেখে\s*এসেছি|রেখেছি|রেখে\s*এসে/.test(text);
  const returned = /ফেরত|ফিরিয়ে|ফিরে এনে/.test(text);
  const expense = /খরচ/.test(text);
  const purchase = /কিনেছি|কিনে এনে|মাল এনে/.test(text);
  const receivedVerb = verbAt(text, RECEIVED) != null;
  const paidVerb = verbAt(text, PAID) != null;

  if (sale && consign) {
    return {
      kind: null,
      notes: ["এক বাক্যে বিক্রি আর মাল রাখা দুটোই আছে। একটা করে বলুন।"],
    };
  }
  if (receivedVerb && paidVerb && !sale && !consign && !returned && !expense && !purchase) {
    return {
      kind: null,
      notes: ["এক বাক্যে টাকা দেওয়া আর পাওয়া দুটোই আছে। একটা করে বলুন।"],
    };
  }

  let kind: FlowKind | null = null;
  if (returned) kind = "return";
  else if (consign) kind = "consign";
  else if (expense) kind = "expense";
  else if (purchase) kind = "purchase";
  else if (sale) kind = "sale";
  else if (receivedVerb) kind = "collection";
  else if (paidVerb) {
    const paid = findPaid(text);
    if (paid == null && !/টাকা/.test(text)) {
      return { kind: null, notes: ["দিয়েছি — মাল, না টাকা? কত টাকা দিয়েছেন, সেটা বলুন।"] };
    }
    kind = "payment";
  }

  if (!kind) {
    return {
      kind: null,
      notes: ["বুঝিনি। বিক্রি, টাকা পাওয়া, মাল রাখা, ফেরত, কেনা, বা খরচ — একটা বলুন।"],
    };
  }

  const party = findParty(
    text,
    books.parties.filter(
      (item) => item.role === "customer" || kind === "purchase" || kind === "payment",
    ),
  );
  const product = findProduct(text, books.products);
  const supplier = kind === "purchase" ? findParty(text, books.parties) : undefined;
  // A name is not an amount: "দেড় লিটার কোক" is a product and "আড়াই হাজারী
  // স্টোর" a shop. Numbers are read from the sentence with those names blanked.
  const numbers = blankNames(text, [party, product, supplier]);
  // Keep explicit decimal amounts out of drafts until the posting policy is defined.
  if (/\d\.\d/.test(numbers)) {
    return {
      kind: null,
      notes: ["দশমিক সংখ্যা পাওয়া গেছে। সঠিক পরিমাণ ফর্মে লিখুন।"],
    };
  }
  // "সাড়ে তিন টাকা" or "দেড় কেস" is not a whole taka or a whole count. A
  // spoken draft never guesses: rounding it, or dropping it and reading the
  // next number instead, would put a wrong figure in front of the owner.
  if (scanAmounts(numbers).some((hit) => !Number.isInteger(hit.value))) {
    return {
      kind: null,
      notes: ["ভগ্নাংশ (যেমন সাড়ে তিন, দেড়) ভয়েসে নেওয়া হয় না। পুরো সংখ্যায় বলুন, বা ফর্মে লিখুন।"],
    };
  }
  const qty = findQty(numbers);
  const price = findPrice(numbers);
  const received = findReceived(numbers);
  const paid = findPaid(numbers);
  const fromConsignment = /রাখা মাল|কনসাইন/.test(text);
  const payFull = /সব টাকা পে|পুরোটা পে|পুরো টাকা পে|নগদ বিক্রি/.test(text);

  const result: ParseResult = {
    kind,
    notes,
    partyId: party?.id,
    productId: product?.id,
    fromConsignment,
    payFull,
  };

  if (qty) {
    result.qtyInput = qty.qty;
    result.unit = qty.unit;
  }
  if (price != null) result.unitPriceTaka = price;
  if (received != null && kind !== "payment") {
    result.receivedTaka = received;
    result.receivedKnown = true;
    result.amountTaka = received;
  }
  if (paid != null) {
    result.paidTaka = paid;
    result.paidKnown = true;
  }

  if (kind === "expense") {
    result.expenseLabel = expenseLabel(text);
    const amount = received ?? paid ?? lastMoney(numbers);
    if (amount != null) result.amountTaka = amount;
  }

  if (kind === "purchase") {
    if (price != null) result.costTaka = price;
    if (supplier) result.partyId = supplier.id;
  }

  if (kind === "payment") {
    const amount = paid ?? lastMoney(numbers);
    if (amount != null) {
      result.paidTaka = amount;
      result.paidKnown = true;
      result.amountTaka = amount;
    }
  }

  if (kind === "return") {
    result.returnMode = /রাখা/.test(text) ? "consign" : "sold";
  }

  if (kind === "sale" && !product && received != null && qty == null) {
    result.amountTaka = received;
  }
  if (kind === "sale" && !product && price != null && received == null) {
    result.amountTaka = price;
  }

  return result;
}

export function draftFromParse(text: string, result: ParseResult, books: Books): Draft {
  if (!result.kind) {
    throw new Error(result.notes[0] ?? "বুঝিনি।");
  }
  const product = books.products.find((item) => item.id === result.productId);
  const notes = [...result.notes];
  const draft: Draft = {
    kind: result.kind,
    step: "confirm",
    partyId: result.partyId,
    productId: result.productId,
    unit: result.unit ?? "pack",
    qtyInput: result.qtyInput ?? 0,
    unitPriceTaka: result.unitPriceTaka ?? (product ? Math.round(product.pricePaisa / 100) : 0),
    receivedTaka: result.receivedTaka ?? 0,
    receivedKnown: Boolean(result.receivedKnown),
    amountTaka: result.amountTaka ?? 0,
    paidTaka: result.paidTaka ?? 0,
    paidKnown: Boolean(result.paidKnown),
    costTaka: result.costTaka ?? (product ? Math.round(product.costPaisa / 100) : 0),
    expenseLabel: result.expenseLabel ?? "",
    returnMode: result.returnMode ?? "sold",
    reasonKnown: result.kind === "return",
    fromConsignment: Boolean(result.fromConsignment),
    partySkipped: false,
    utterance: text,
    notes,
  };

  if (draft.kind === "sale" && result.payFull && draft.productId && draft.qtyInput > 0) {
    const pack = product?.packSize ?? 1;
    const pieces = draft.unit === "pack" ? draft.qtyInput * pack : draft.qtyInput;
    draft.receivedTaka = pieces * draft.unitPriceTaka;
    draft.receivedKnown = true;
  } else if (draft.kind === "sale" && !result.receivedKnown) {
    draft.receivedTaka = 0;
    draft.receivedKnown = true;
    notes.push(
      result.paidKnown
        ? "দিয়েছি মানে টাকা দিয়েছেন, পাননি। কত পেয়েছেন বলেননি — পুরোটা বাকি ধরা হয়েছে।"
        : "কত টাকা পেয়েছেন বলেননি। শূন্য ধরা হয়েছে — পুরোটা বাকি।",
    );
  }

  if (
    draft.kind === "sale" &&
    result.unitPriceTaka == null &&
    product &&
    (books.mode === "stock" || draft.productId)
  ) {
    notes.push("দাম আগের মতো ধরা হয়েছে। মিলিয়ে নিন।");
  }

  if (draft.kind === "collection" && result.receivedTaka != null) {
    draft.amountTaka = result.receivedTaka;
  }
  if (draft.kind === "payment") {
    draft.amountTaka = result.paidTaka ?? result.amountTaka ?? 0;
  }
  if (draft.kind === "purchase") {
    draft.paidTaka = result.paidTaka ?? 0;
    draft.paidKnown = Boolean(result.paidKnown);
  }
  return draft;
}

function findParty(text: string, parties: Party[]): Party | undefined {
  const ranked = parties
    .flatMap((party) =>
      [party.name, ...party.aliases].map((alias) => ({ party, alias: normalizeText(alias) })),
    )
    .filter((item) => item.alias.length >= 2)
    .sort((a, b) => b.alias.length - a.alias.length);
  return ranked.find((item) => text.includes(item.alias))?.party;
}

function findProduct(text: string, products: Product[]): Product | undefined {
  const ranked = products
    .flatMap((product) =>
      [product.name, ...product.aliases].map((alias) => ({ product, alias: normalizeText(alias) })),
    )
    .filter((item) => item.alias.length >= 2)
    .sort((a, b) => b.alias.length - a.alias.length);
  return ranked.find((item) => text.includes(item.alias))?.product;
}

function findQty(text: string): { qty: number; unit: "pack" | "pcs" } | null {
  const pack = numberBeforeUnit(text, PACK_UNIT, 3);
  if (pack != null) return { qty: pack, unit: "pack" };
  const re = /পিস|পিছ/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const near = text.slice(Math.max(0, match.index - 8), match.index);
    if (/প্রতি\s*$/.test(near)) continue;
    const slice = text.slice(0, match.index);
    const qty = amountEndingBefore(slice, slice.length, 3);
    if (qty != null) return { qty, unit: "pcs" };
  }
  return null;
}

function findPrice(text: string): number | null {
  const at = text.search(/প্রতি/);
  if (at < 0) return null;
  return firstAmountFrom(text, at, 40);
}

function findReceived(text: string): number | null {
  const at = verbAt(text, RECEIVED);
  if (at == null) return null;
  return amountBeside(text, at, RECEIVED);
}

function findPaid(text: string): number | null {
  const at = verbAt(text, PAID);
  if (at == null) return null;
  return amountBeside(text, at, PAID);
}

function verbAt(text: string, pattern: RegExp): number | null {
  const re = new RegExp(pattern.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const before = text[match.index - 1];
    const after = text[match.index + match[0].length];
    if (before && isBengali(before)) continue;
    if (after && isBengali(after)) continue;
    return match.index;
  }
  return null;
}

function isBengali(ch: string | undefined): boolean {
  if (!ch) return false;
  const c = ch.codePointAt(0) ?? 0;
  return c >= 0x0980 && c <= 0x09ff;
}

function amountBeside(text: string, index: number, pattern: RegExp): number | null {
  const before = amountEndingBefore(text, index, 14);
  if (before != null) return before;
  const word = pattern.exec(text.slice(index))?.[0].length ?? 0;
  return firstAmountFrom(text, index + word, 18);
}

/*
 * The first amount that starts within `span` characters of `from`. It is
 * picked from one scan of the whole sentence: scanning a slice instead could
 * cut "তেরো হাজার দেড়শো" short, or leave "আড়াই" of "পাঁচ লাখ আড়াই হাজার" alone.
 */
function firstAmountFrom(text: string, from: number, span: number): number | null {
  const hit = scanAmounts(text).find((item) => item.start >= from && item.start < from + span);
  return hit?.value ?? null;
}

/*
 * Replace each matched party or product name with "_" of the same length, so
 * positions still line up with `text`. "_" is neither Bangla nor a space: a
 * number next to it still reads, and two amounts either side of a removed name
 * are not merged into one.
 */
function blankNames(text: string, named: ({ name: string; aliases: string[] } | undefined)[]) {
  let out = text;
  for (const item of named) {
    if (!item) continue;
    for (const alias of [item.name, ...item.aliases].map(normalizeText)) {
      if (alias.length < 2) continue;
      out = out.split(alias).join("_".repeat(alias.length));
    }
  }
  return out;
}

function lastMoney(text: string): number | null {
  const nums = scanAmounts(text);
  return nums.length ? nums[nums.length - 1]!.value : null;
}

function amountEndingBefore(text: string, index: number, gap: number): number | null {
  const nums = scanAmounts(text.slice(0, index));
  if (!nums.length) return null;
  const last = nums[nums.length - 1]!;
  if (index - last.end > gap) return null;
  return last.value;
}

function numberBeforeUnit(text: string, unit: RegExp, gap: number): number | null {
  const match = unit.exec(text);
  if (!match) return null;
  return amountEndingBefore(text, match.index, gap);
}

function expenseLabel(text: string): string {
  if (/ভাড়া|ভাড়া/.test(text) && !/গাড়ি|গাড়ি/.test(text)) return "ভাড়া";
  if (/পরিবহন|গাড়ি|গাড়ি|ভাড়া/.test(text)) return "পরিবহন";
  if (/নাস্তা|চা/.test(text)) return "চা-নাস্তা";
  if (/বিদ্যুৎ|বিদ্যুৎ|কারেন্ট|বিল/.test(text)) return "বিদ্যুৎ";
  return "অন্যান্য";
}
