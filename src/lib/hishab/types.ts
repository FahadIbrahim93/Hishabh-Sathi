export type Mode = "khata" | "stock";

export type Account =
  | "cash"
  | "revenue"
  | "cogs"
  | "inventory"
  | "receivable"
  | "payable"
  | "expense"
  | "capital";

export type EntryKind =
  | "opening"
  | "sale"
  | "collection"
  | "payment"
  | "consign"
  | "return"
  | "purchase"
  | "expense"
  | "reversal";

export type FlowKind = "sale" | "collection" | "payment" | "consign" | "return" | "purchase" | "expense";

export type FlowStep = "party" | "product" | "money" | "reason" | "confirm";

export interface Party {
  id: string;
  name: string;
  aliases: string[];
  role: "customer" | "supplier";
  phone?: string;
  archived?: boolean;
}

export interface Product {
  id: string;
  name: string;
  aliases: string[];
  packName: string;
  packSize: number;
  pricePaisa: number;
  costPaisa: number;
  archived?: boolean;
}

export interface JournalLine {
  account: Account;
  partyId?: string;
  debit: number;
  credit: number;
}

export interface StockMove {
  productId: string;
  location: string;
  qtyDelta: number;
}

export interface EntryMeta {
  qty?: number;
  unitPrice?: number;
  total?: number;
  received?: number;
  refund?: number;
  label?: string;
  returnMode?: "sold" | "consign";
  fromConsignment?: boolean;
  packSize?: number;
  reason?: string;
}

export interface Entry {
  id: string;
  kind: EntryKind;
  at: number;
  partyId?: string;
  productId?: string;
  summary: string;
  lines: JournalLine[];
  stock: StockMove[];
  meta: EntryMeta;
  costUpdate?: { productId: string; costPaisa: number };
  priceUpdate?: { productId: string; pricePaisa: number };
  reversesEntryId?: string;
}

export interface Books {
  version: 1;
  businessName: string;
  mode: Mode;
  parties: Party[];
  products: Product[];
  entries: Entry[];
}

export interface Draft {
  kind: FlowKind;
  step: FlowStep;
  partyId?: string;
  productId?: string;
  unit: "pack" | "pcs";
  qtyInput: number;
  unitPriceTaka: number;
  receivedTaka: number;
  receivedKnown: boolean;
  amountTaka: number;
  paidTaka: number;
  paidKnown: boolean;
  costTaka: number;
  expenseLabel: string;
  returnMode: "sold" | "consign";
  reasonKnown: boolean;
  fromConsignment: boolean;
  partySkipped: boolean;
  utterance?: string;
  notes: string[];
}

export const WAREHOUSE = "warehouse";

export function partyLoc(partyId: string): string {
  return `party:${partyId}`;
}
