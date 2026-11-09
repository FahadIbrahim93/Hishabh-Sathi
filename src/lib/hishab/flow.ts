import {
  apply,
  balance,
  buildCollection,
  buildConsign,
  buildExpense,
  buildPayment,
  buildPurchase,
  buildReturn,
  buildSale,
  explain,
  productById,
  productsAt,
  stockAt,
} from "./engine.ts";
import { formatQty, formatTaka, takaToPaisa, takaWords } from "./money.ts";
import { WAREHOUSE, partyLoc, type Books, type Draft, type Entry, type FlowKind, type FlowStep, type Mode } from "./types.ts";

export function blankDraft(kind: FlowKind, extra: Partial<Draft> = {}): Draft {
  return {
    kind,
    step: "party",
    unit: "pack",
    qtyInput: 0,
    unitPriceTaka: 0,
    receivedTaka: 0,
    receivedKnown: false,
    amountTaka: 0,
    paidTaka: 0,
    paidKnown: false,
    costTaka: 0,
    expenseLabel: "",
    returnMode: "sold",
    reasonKnown: false,
    fromConsignment: false,
    partySkipped: false,
    notes: [],
    ...extra,
  };
}

export function stepsFor(draft: Draft, mode: Mode): FlowStep[] {
  if (draft.kind === "expense") return ["money", "confirm"];
  if (draft.kind === "collection" || draft.kind === "payment") return ["party", "money", "confirm"];
  if (draft.kind === "consign") return ["party", "product", "confirm"];
  if (draft.kind === "return") return ["party", "product", "reason", "confirm"];
  if (draft.kind === "purchase") return ["party", "product", "money", "confirm"];
  if (draft.productId || mode === "stock") return ["party", "product", "money", "confirm"];
  return ["party", "money", "confirm"];
}

export function piecesOf(draft: Draft, packSize: number): number {
  if (draft.qtyInput <= 0) return 0;
  return draft.unit === "pack" ? draft.qtyInput * Math.max(packSize, 1) : draft.qtyInput;
}

export function firstGap(draft: Draft, books: Books): FlowStep {
  for (const step of stepsFor(draft, books.mode)) {
    if (step === "confirm") return "confirm";
    if (!stepDone(step, draft, books)) return step;
  }
  return "confirm";
}

function stepDone(step: FlowStep, draft: Draft, books: Books): boolean {
  if (step === "party") {
    if (draft.kind === "purchase" || draft.kind === "payment") return Boolean(draft.partyId) || draft.partySkipped;
    if (draft.kind === "expense") return true;
    if (draft.kind === "sale" && !draft.productId && books.mode === "khata") {
      const due = draft.receivedKnown ? draft.amountTaka - draft.receivedTaka : draft.amountTaka;
      if (due <= 0 && draft.receivedKnown && draft.amountTaka > 0) return true;
    }
    return Boolean(draft.partyId);
  }
  if (step === "product") return Boolean(draft.productId) && draft.qtyInput > 0;
  if (step === "reason") return draft.reasonKnown;
  if (step === "money") {
    if (draft.kind === "expense") return draft.amountTaka > 0 && Boolean(draft.expenseLabel);
    if (draft.kind === "collection" || draft.kind === "payment") return draft.amountTaka > 0;
    if (draft.kind === "purchase") return draft.costTaka > 0 && draft.paidKnown;
    if (draft.productId || books.mode === "stock") return draft.unitPriceTaka > 0 && draft.receivedKnown;
    return draft.amountTaka > 0 && draft.receivedKnown;
  }
  return true;
}

export function entryFromDraft(books: Books, draft: Draft, id: string, at = Date.now()): Entry {
  const product = productById(books, draft.productId);
  if (draft.kind === "sale" && (draft.productId || books.mode === "stock")) {
    return buildSale(books, {
      id,
      at,
      partyId: draft.partyId,
      productId: draft.productId,
      qty: piecesOf(draft, product?.packSize ?? 1),
      unitPricePaisa: takaToPaisa(draft.unitPriceTaka),
      receivedPaisa: takaToPaisa(draft.receivedTaka),
      fromConsignment: draft.fromConsignment,
    });
  }
  if (draft.kind === "sale") {
    return buildSale(books, {
      id,
      at,
      partyId: draft.partyId,
      totalPaisa: takaToPaisa(draft.amountTaka),
      receivedPaisa: takaToPaisa(draft.receivedTaka),
    });
  }
  if (draft.kind === "collection") {
    if (!draft.partyId) throw new Error("দোকান বেছে নিন।");
    return buildCollection(books, {
      id,
      at,
      partyId: draft.partyId,
      amountPaisa: takaToPaisa(draft.amountTaka),
    });
  }
  if (draft.kind === "payment") {
    return buildPayment(books, {
      id,
      at,
      partyId: draft.partySkipped ? undefined : draft.partyId,
      amountPaisa: takaToPaisa(draft.amountTaka),
    });
  }
  if (draft.kind === "consign") {
    if (!draft.partyId || !draft.productId) throw new Error("দোকান আর মাল দুটোই লাগবে।");
    return buildConsign(books, {
      id,
      at,
      partyId: draft.partyId,
      productId: draft.productId,
      qty: piecesOf(draft, product?.packSize ?? 1),
    });
  }
  if (draft.kind === "return") {
    if (!draft.partyId || !draft.productId) throw new Error("দোকান আর মাল দুটোই লাগবে।");
    return buildReturn(books, {
      id,
      at,
      partyId: draft.partyId,
      productId: draft.productId,
      qty: piecesOf(draft, product?.packSize ?? 1),
      unitPricePaisa: takaToPaisa(draft.unitPriceTaka || Math.round((product?.pricePaisa ?? 0) / 100)),
      mode: draft.returnMode,
      reason: draft.expenseLabel || undefined,
    });
  }
  if (draft.kind === "purchase") {
    if (!draft.productId) throw new Error("কোন মাল এনেছেন?");
    return buildPurchase(books, {
      id,
      at,
      partyId: draft.partySkipped ? undefined : draft.partyId,
      productId: draft.productId,
      qty: piecesOf(draft, product?.packSize ?? 1),
      costPaisa: takaToPaisa(draft.costTaka),
      paidPaisa: takaToPaisa(draft.paidTaka),
    });
  }
  return buildExpense(books, {
    id,
    at,
    amountPaisa: takaToPaisa(draft.amountTaka),
    label: draft.expenseLabel,
  });
}

export interface Preview {
  ok: true;
  title: string;
  rows: { k: string; v: string }[];
  foot?: string;
  readback: string;
  banner?: { title: string; body: string };
  after: { k: string; v: string }[];
}

export function previewDraft(books: Books, draft: Draft, at = Date.now()): Preview | { ok: false; error: string } {
  try {
    const entry = entryFromDraft(books, draft, "preview-temp", at);
    const next = apply(structuredClone(books), entry);
    const view = explain(books, entry);
    const after: { k: string; v: string }[] = [];
    if (entry.partyId && (entry.kind === "sale" || entry.kind === "collection" || entry.kind === "return" || entry.kind === "payment")) {
      if (entry.kind !== "payment" || entry.meta.label === "পাওনা বাড়বে") {
        after.push({ k: "এই দোকানের পাওনা হবে", v: formatTaka(balance(next, "receivable", entry.partyId)) });
      }
      if (entry.kind === "payment" && entry.meta.label === "দেনা শোধ") {
        after.push({ k: "এখন দেনা", v: formatTaka(balance(next, "payable", entry.partyId)) });
      }
    }
    if (entry.kind === "payment") {
      after.push({ k: "নগদ থাকবে", v: formatTaka(balance(next, "cash")) });
    }
    if (entry.productId && entry.kind !== "expense") {
      const product = productById(books, entry.productId);
      if (product) {
        after.push({
          k: "গুদামে থাকবে",
          v: formatQty(stockAt(next, product.id, WAREHOUSE), product.packSize, product.packName),
        });
        if (entry.partyId) {
          const held = productsAt(next, partyLoc(entry.partyId)).filter((row) => row.product.id === product.id);
          if (held.length || entry.kind === "consign") {
            after.push({
              k: "দোকানে রাখা মাল",
              v: formatQty(stockAt(next, product.id, partyLoc(entry.partyId)), product.packSize, product.packName),
            });
          }
        }
      }
    }
    return {
      ok: true,
      title: view.title,
      rows: view.rows,
      foot: view.foot,
      readback: readback(draft, books),
      banner: bannerFor(entry.kind, Boolean(entry.meta.fromConsignment), entry.meta.returnMode, entry.meta.label),
      after,
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "হিসাব মেলানো যায়নি।" };
  }
}

function bannerFor(
  kind: Entry["kind"],
  fromConsignment: boolean,
  returnMode?: "sold" | "consign",
  label?: string,
): Preview["banner"] {
  if (kind === "consign" || returnMode === "consign") {
    return {
      title: "এটা বিক্রি নয়",
      body: "মাল এখনও আপনার। দোকানের পাওনা বাড়বে না, বিক্রিও বাড়বে না।",
    };
  }
  if (kind === "collection") {
    return {
      title: "পুরনো বাকি",
      body: "আজকের বিক্রি বাড়বে না। শুধু আগের পাওনা কমবে।",
    };
  }
  if (kind === "payment") {
    if (label === "দেনা শোধ") {
      return { title: "টাকা দিয়েছেন", body: "এটা টাকা পাওয়া নয়। আগের দেনা শোধ হবে।" };
    }
    if (label === "পাওনা বাড়বে") {
      return { title: "টাকা দিয়েছেন", body: "পেয়েছি নয়। এই টাকা এখন ওনার পাওনা।" };
    }
    return { title: "টাকা দিয়েছেন", body: "নগদ কমবে। বিক্রি বাড়বে না।" };
  }
  if (fromConsignment) {
    return {
      title: "রাখা মাল এখন বিক্রি",
      body: "যে মাল দোকানে ছিল, সেটাই বিক্রি ধরা হবে।",
    };
  }
  return undefined;
}

export function readback(draft: Draft, books: Books): string {
  const product = productById(books, draft.productId);
  if (draft.kind === "sale" && (draft.productId || books.mode === "stock")) {
    const pieces = piecesOf(draft, product?.packSize ?? 1);
    const total = pieces * draft.unitPriceTaka;
    const got = draft.receivedTaka;
    const due = Math.max(total - got, 0);
    return `${takaWords(total)} টাকার বিক্রি, ${takaWords(got)} টাকা পেয়েছেন, ${takaWords(due)} টাকা বাকি।`;
  }
  if (draft.kind === "sale") {
    const due = Math.max(draft.amountTaka - draft.receivedTaka, 0);
    return `${takaWords(draft.amountTaka)} টাকার বিক্রি, ${takaWords(draft.receivedTaka)} টাকা পেয়েছেন, ${takaWords(due)} টাকা বাকি।`;
  }
  if (draft.kind === "collection") {
    return `${takaWords(draft.amountTaka)} টাকা পেয়েছেন। এটা নতুন বিক্রি নয়।`;
  }
  if (draft.kind === "payment") {
    const who = books.parties.find((party) => party.id === draft.partyId)?.name;
    return who
      ? `${who}-কে ${takaWords(draft.amountTaka)} টাকা দিয়েছেন। পাননি।`
      : `${takaWords(draft.amountTaka)} টাকা দিয়েছেন। পাননি।`;
  }
  if (draft.kind === "consign" && product) {
    return `${formatQty(piecesOf(draft, product.packSize), product.packSize, product.packName)} দোকানে রাখা হচ্ছে। এটা বিক্রি নয়।`;
  }
  if (draft.kind === "return" && draft.returnMode === "consign") {
    return "রাখা মাল ফিরে আসছে। বিক্রি বা পাওনা বদলাবে না।";
  }
  if (draft.kind === "return") return "বিক্রি ফেরত। মাল বাড়বে, হিসাব উল্টে যাবে।";
  if (draft.kind === "purchase") {
    const pieces = piecesOf(draft, product?.packSize ?? 1);
    return `${takaWords(pieces * draft.costTaka)} টাকার মাল কেনা।`;
  }
  return `${takaWords(draft.amountTaka)} টাকা ${draft.expenseLabel || "খরচ"}।`;
}

export const READBACK_LIGHTER =
  "এক হাজার টাকার বিক্রি, ছয়শ টাকা পেয়েছেন, চারশ টাকা বাকি।";
