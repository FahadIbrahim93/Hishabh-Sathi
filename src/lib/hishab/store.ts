import { create } from "zustand";
import { apply, buildOpening, buildReversal, buildStockAdd } from "./engine.ts";
import { makeSeed } from "./seed.ts";
import { takaToPaisa } from "./money.ts";
import { openDB, DBSchema, type IDBPDatabase } from "idb";
import type { Books, Draft, Entry, Mode, Party, Product } from "./types.ts";

/* ------------------------------------------------------------------ */
/* IndexedDB — versioned migration framework                          */
/* ------------------------------------------------------------------ */
/*
 * DB_VERSION is the on-disk schema version. To change the data shape,
 * bump DB_VERSION and add an `upgrade` branch for the new version.
 * Migrations run in order on first open after a version bump, so an
 * existing IndexedDB database is never overwritten — only upgraded.
 */
const DB_NAME = "hishab-sathi";
const STORE_NAME = "books";
const DB_KEY = "main";
const DB_VERSION = 1;

interface HishabDB extends DBSchema {
  books: {
    key: string;
    value: Books;
  };
}

let dbInstance: IDBPDatabase<HishabDB> | null = null;
let dbReady: Promise<IDBPDatabase<HishabDB>> | null = null;

async function openDb(): Promise<IDBPDatabase<HishabDB>> {
  if (dbInstance) return dbInstance;
  if (!dbReady) {
    dbReady = openDB<HishabDB>(DB_NAME, DB_VERSION, {
      upgrade(db, _oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        // oldVersion < 2: future migrations go here, e.g.
        // if (oldVersion < 2) { ... }
      },
    });
  }
  dbInstance = await dbReady;
  return dbInstance;
}

async function readDbBooks(): Promise<Books | null> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, "readonly");
    const value = await tx.objectStore(STORE_NAME).get(DB_KEY);
    await tx.done;
    return value ?? null;
  } catch {
    return null;
  }
}

async function persistDbBooks(books: Books): Promise<boolean> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(books, DB_KEY);
    await tx.done;
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Legacy localStorage migration (hishab-sathi-v1)                    */
/* ------------------------------------------------------------------ */
/*
 * Phase 1: migrate data that still lives in one browser's localStorage
 * into IndexedDB on first load, then drop the legacy key so the owner's
 * books survive a browser clear.
 */
const LEGACY_KEY = "hishab-sathi-v1";

function readLegacyBooks(): Books | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const books = JSON.parse(raw) as Books;
    if (books.version !== 1 || !Array.isArray(books.entries) || !Array.isArray(books.parties)) return null;
    return books;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Zustand store                                                      */
/* ------------------------------------------------------------------ */

export type TabId = "home" | "dues" | "stock" | "more";

export type Screen =
  | { id: TabId }
  | { id: "visit" }
  | { id: "shop"; partyId: string }
  | { id: "ledger" }
  | { id: "report" }
  | { id: "guide" }
  | { id: "entry"; entryId: string }
  | { id: "flow" }
  | { id: "receipt"; entryId: string };

interface NewProduct {
  name: string;
  packName: string;
  packSize: number;
  priceTaka: number;
  costTaka: number;
  qty: number;
}

interface HishabState {
  books: Books;
  nav: Screen[];
  draft: Draft | null;
  ready: boolean;
  onboarded: boolean;
  saved: boolean;
  toast: string | null;
  hydrate: () => Promise<void>;
  goTab: (id: TabId) => void;
  push: (screen: Screen) => void;
  back: () => void;
  openDraft: (draft: Draft) => void;
  patchDraft: (patch: Partial<Draft>) => void;
  flowBack: (step: Draft["step"] | "exit") => void;
  commitEntry: (entry: Entry) => void;
  addParty: (name: string, role: Party["role"], phone?: string) => string;
  addProduct: (input: NewProduct) => string;
  editParty: (id: string, patch: { name?: string; phone?: string; role?: Party["role"] }) => void;
  archiveParty: (id: string) => void;
  editProduct: (id: string, patch: { name?: string; packName?: string; packSize?: number; priceTaka?: number; costTaka?: number }) => void;
  archiveProduct: (id: string) => void;
  setMode: (mode: Mode) => void;
  setOnboarded: (value: boolean) => void;
  createBusiness: (name: string, cashPaisa: number) => Promise<void>;
  reverseEntry: (entryId: string, reason: string) => void;
  exportBooks: () => string;
  importBooks: (json: string) => void;
  resetDemo: () => void;
  dismissToast: () => void;
}

function emptyBooks(): Books {
  return { version: 1, businessName: "", mode: "stock", parties: [], products: [], entries: [] };
}

/*
 * Persist writes are sequenced so a slower earlier write can never
 * overwrite a newer one (fire-and-forget from sync actions).
 */
let persistChain: Promise<unknown> = Promise.resolve();
function persistSafe(books: Books): Promise<void> {
  persistChain = persistChain.then(() => persistDbBooks(books).catch(() => undefined));
  return persistChain as Promise<void>;
}

export const useHishab = create<HishabState>((set, get) => ({
  books: emptyBooks(),
  nav: [{ id: "home" }],
  draft: null,
  ready: false,
  onboarded: false,
  saved: true,
  toast: null,
  hydrate: async () => {
    if (get().ready) return;
    let books = await readDbBooks();
    let migrated = false;
    if (!books) {
      const legacy = readLegacyBooks();
      if (legacy) {
        books = legacy;
        migrated = true;
      } else {
        books = emptyBooks();
      }
    }
    const saved = await persistDbBooks(books);
    if (migrated && saved) {
      localStorage.removeItem(LEGACY_KEY);
    }
    set({
      books,
      ready: true,
      saved,
      onboarded: Boolean(books.businessName),
    });
  },
  goTab: (id) => set({ nav: [{ id }], draft: null }),
  push: (screen) => set({ nav: [...get().nav, screen] }),
  back: () => {
    const nav = get().nav;
    if (nav.length <= 1) return;
    set({ nav: nav.slice(0, -1), draft: nav[nav.length - 1]?.id === "flow" ? null : get().draft });
  },
  openDraft: (draft) => {
    const nav = get().nav;
    const top = nav[nav.length - 1];
    set({ draft, nav: top?.id === "flow" ? nav : [...nav, { id: "flow" }] });
  },
  patchDraft: (patch) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: { ...draft, ...patch } });
  },
  flowBack: (step) => {
    if (step === "exit") {
      const nav = get().nav;
      set({ draft: null, nav: nav[nav.length - 1]?.id === "flow" ? nav.slice(0, -1) : nav });
      return;
    }
    get().patchDraft({ step });
  },
  commitEntry: (entry) => {
    const books = apply(get().books, entry);
    const nav = get().nav.filter((screen) => screen.id !== "flow");
    nav.push({ id: "receipt", entryId: entry.id });
    set({ books, saved: true, nav, draft: null, toast: "হিসাব সেভ হয়েছে" });
    persistSafe(books).catch(() => set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }));
  },
  addParty: (name, role, phone?) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("দোকানের নাম লিখুন।");
    const id = `p-${crypto.randomUUID()}`;
    const party: Party = { id, name: trimmed, aliases: [trimmed], role, phone: phone?.trim() || undefined };
    const books = { ...get().books, parties: [...get().books.parties, party] };
    set({ books, saved: true });
    persistSafe(books).catch(() => set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }));
    return id;
  },
  addProduct: (input) => {
    const name = input.name.trim();
    if (!name) throw new Error("মালের নাম লিখুন।");
    if (!Number.isInteger(input.packSize) || input.packSize < 1) throw new Error("কেসে কত পিস, সেটা বলুন।");
    const id = `g-${crypto.randomUUID()}`;
    const product: Product = {
      id,
      name,
      aliases: [name],
      packName: input.packName.trim() || "কেস",
      packSize: input.packSize,
      pricePaisa: takaToPaisa(input.priceTaka),
      costPaisa: takaToPaisa(input.costTaka),
    };
    let books: Books = { ...get().books, products: [...get().books.products, product] };
    if (input.qty > 0) {
      books = apply(
        books,
        buildStockAdd(books, {
          id: crypto.randomUUID(),
          at: Date.now(),
          productId: id,
          qty: input.qty,
          costPaisa: product.costPaisa,
        }),
      );
    }
    set({ books, saved: true, toast: "মাল যোগ হয়েছে" });
    persistSafe(books).catch(() => set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }));
    return id;
  },
  editParty: (id, patch) => {
    const books = get().books;
    const party = books.parties.find((p) => p.id === id);
    if (!party) throw new Error("দোকান পাওয়া যায়নি।");
    const next = books.parties.map((p) => (p.id === id ? { ...p, ...patch } : p));
    set({ books: { ...books, parties: next }, saved: true });
    persistSafe({ ...books, parties: next }).catch(() =>
      set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }),
    );
  },
  archiveParty: (id) => {
    const books = get().books;
    const party = books.parties.find((p) => p.id === id);
    if (!party) throw new Error("দোকান পাওয়া যায়নি।");
    const next = books.parties.map((p) => (p.id === id ? { ...p, archived: true } : p));
    set({ books: { ...books, parties: next }, saved: true });
    persistSafe({ ...books, parties: next }).catch(() =>
      set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }),
    );
  },
  editProduct: (id, patch) => {
    const books = get().books;
    const product = books.products.find((p) => p.id === id);
    if (!product) throw new Error("মাল পাওয়া যায়নি।");
    if (patch.packSize != null && (!Number.isInteger(patch.packSize) || patch.packSize < 1)) {
      throw new Error("কেসে কত পিস, সেটা বলুন।");
    }
    const next = books.products.map((p) => {
      if (p.id !== id) return p;
      const updated: Product = { ...p, ...patch };
      if (patch.priceTaka != null) updated.pricePaisa = takaToPaisa(patch.priceTaka);
      if (patch.costTaka != null) updated.costPaisa = takaToPaisa(patch.costTaka);
      return updated;
    });
    set({ books: { ...books, products: next }, saved: true });
    persistSafe({ ...books, products: next }).catch(() =>
      set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }),
    );
  },
  archiveProduct: (id) => {
    const books = get().books;
    const product = books.products.find((p) => p.id === id);
    if (!product) throw new Error("মাল পাওয়া যায়নি।");
    const next = books.products.map((p) => (p.id === id ? { ...p, archived: true } : p));
    set({ books: { ...books, products: next }, saved: true });
    persistSafe({ ...books, products: next }).catch(() =>
      set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }),
    );
  },
  setMode: (mode) => {
    const books = { ...get().books, mode };
    set({ books, saved: true });
    persistSafe(books).catch(() => set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }));
  },
  setOnboarded: (value) => set({ onboarded: value }),
  createBusiness: async (name, cashPaisa) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("দোকানের নাম লিখুন।");
    const books = { ...get().books, businessName: trimmed };
    let opened = books;
    if (cashPaisa > 0) {
      opened = apply(books, buildOpening({
        id: `open-${crypto.randomUUID()}`,
        at: Date.now(),
        cashPaisa,
        stock: [],
        products: [],
      }));
    }
    set({ books: opened, onboarded: true, saved: true });
    await persistSafe(opened);
  },
  reverseEntry: (entryId: string, reason: string) => {
    const books = get().books;
    const original = books.entries.find((e) => e.id === entryId);
    if (!original) throw new Error("হিসাব পাওয়া যায়নি।");
    if (original.kind === "opening" || original.kind === "reversal") {
      throw new Error("এই হিসাব বিলোপ করা যায় না।");
    }
    const trimmed = reason.trim();
    if (!trimmed) throw new Error("বিলোপের কারণ লিখুন।");
    const reversal = buildReversal({
      id: `rev-${crypto.randomUUID()}`,
      at: Date.now(),
      original,
      reason: trimmed,
    });
    const next = apply(books, reversal);
    set({ books: next, saved: true, toast: "হিসাব বিলোপ করা হয়েছে" });
    persistSafe(next).catch(() =>
      set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }),
    );
  },
  exportBooks: () => {
    return JSON.stringify(get().books, null, 2);
  },
  importBooks: (json) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error("ভুল ফাইল। এই ব্যাকআপ ফেরায়নি।");
    }
    const books = parsed as Books;
    if (
      !books ||
      books.version !== 1 ||
      !Array.isArray(books.entries) ||
      !Array.isArray(books.parties) ||
      !Array.isArray(books.products) ||
      typeof books.businessName !== "string"
    ) {
      throw new Error("ভুল ফাইল। এই ব্যাকআপ ফেরায়নি।");
    }
    set({ books, saved: true, toast: "ব্যাকআপ ফেরত আনা হয়েছে" });
    persistSafe(books).catch(() =>
      set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }),
    );
  },
  resetDemo: () => {
    const books = makeSeed();
    set({
      books,
      saved: true,
      nav: [{ id: "home" }],
      draft: null,
      toast: "ডেমো হিসাব আবার বসানো হয়েছে",
    });
    persistSafe(books).catch(() => set({ saved: false, toast: "সেভ হয়নি। আবার চেষ্টা করুন।" }));
  },
  dismissToast: () => set({ toast: null }),
}));
