import { create } from "zustand";
import { BooksError, apply, buildOpening, buildReversal, buildStockAdd } from "./engine.ts";
import { parseBackup } from "./backup.ts";
import { makeSeed } from "./seed.ts";
import { takaToPaisa } from "./money.ts";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
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
      terminated() {
        dbInstance = null;
        dbReady = null;
      },
    }).catch((error) => {
      dbReady = null;
      throw error;
    });
  }
  dbInstance = await dbReady;
  return dbInstance;
}

function isEmptyBooks(books: Books): boolean {
  return (
    books.businessName === "" &&
    books.parties.length === 0 &&
    books.products.length === 0 &&
    books.entries.length === 0
  );
}

// Compare and write inside one transaction so a stale confirmation cannot
// replace books that another tab has already updated.
async function writeConfirmedBooks(previous: Books, next: Books): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    try {
      const store = tx.objectStore(STORE_NAME);
      const current = await store.get(DB_KEY);
      // A brand-new device has no record yet, which matches an expected empty shop.
      const untouched = current === undefined && isEmptyBooks(previous);
      if (!untouched && JSON.stringify(current) !== JSON.stringify(previous)) {
        throw new BooksError("হিসাব বদলেছে। আবার খুলে পাওনা মিলিয়ে নিন।");
      }
      await store.put(next, DB_KEY);
    } finally {
      await tx.done;
    }
  } catch (error) {
    if (error instanceof BooksError) throw error;
    throw new Error("এই ফোনে সেভ হয়নি। আবার চেষ্টা করুন।", { cause: error });
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

function checkBooks(value: unknown): Books {
  const books = value as Partial<Books> | null;
  if (
    !books ||
    books.version !== 1 ||
    typeof books.businessName !== "string" ||
    !Array.isArray(books.entries) ||
    !Array.isArray(books.parties) ||
    !Array.isArray(books.products)
  ) {
    throw new Error("Invalid stored books");
  }
  return books as Books;
}

// Checking for an existing record and importing legacy books share a
// transaction. Two tabs starting together cannot replace one another's ledger.
async function loadDeviceBooks(): Promise<Books> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const records = tx.objectStore(STORE_NAME);
  let migrated: Books;
  try {
    const current = await records.get(DB_KEY);
    if (current !== undefined) return checkBooks(current);
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw === null) return emptyBooks();
    migrated = checkBooks(JSON.parse(raw));
    await records.add(migrated, DB_KEY);
  } finally {
    await tx.done;
  }

  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // The committed IndexedDB record takes precedence on the next startup.
  }
  return migrated;
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
  startupFailed: boolean;
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
  pendingReceipt: { entryId: string; done: Promise<void> } | null;
  commitEntry: (entry: Entry) => Promise<void>;
  addParty: (name: string, role: Party["role"], phone?: string) => Promise<string>;
  addProduct: (input: NewProduct) => Promise<string>;
  editParty: (id: string, patch: { name?: string; phone?: string; role?: Party["role"] }) => Promise<void>;
  archiveParty: (id: string) => Promise<void>;
  editProduct: (
    id: string,
    patch: {
      name?: string;
      packName?: string;
      packSize?: number;
      priceTaka?: number;
      costTaka?: number;
    },
  ) => Promise<void>;
  archiveProduct: (id: string) => Promise<void>;
  setMode: (mode: Mode) => Promise<void>;
  setOnboarded: (value: boolean) => void;
  createBusiness: (name: string, cashPaisa: number) => Promise<void>;
  pendingReversal: { originalId: string; done: Promise<void> } | null;
  reverseEntry: (entryId: string, reason: string) => Promise<void>;
  exportBooks: () => string;
  restoring: boolean;
  importBooks: (source: string | Blob) => Promise<void>;
  resetDemo: () => Promise<void>;
  dismissToast: () => void;
}

function emptyBooks(): Books {
  return { version: 1, businessName: "", mode: "stock", parties: [], products: [], entries: [] };
}

let startup: Promise<void> | undefined;
let persistChain: Promise<unknown> = Promise.resolve();

function commitCatalog(
  next: Books,
  success: Partial<Pick<HishabState, "toast" | "onboarded" | "nav" | "draft">> = {},
): Promise<void> {
  const previous = useHishab.getState().books;
  const done = persistChain.then(async () => {
    try {
      await writeConfirmedBooks(previous, next);
      useHishab.setState({ books: next, saved: true, ...success });
    } catch (error) {
      const message = error instanceof Error ? error.message : "সেভ হয়নি। আবার চেষ্টা করুন।";
      useHishab.setState({ saved: false, toast: message });
      throw error;
    }
  });
  persistChain = done.catch(() => undefined);
  return done;
}

export const useHishab = create<HishabState>((set, get) => ({
  books: emptyBooks(),
  nav: [{ id: "home" }],
  draft: null,
  ready: false,
  onboarded: false,
  saved: true,
  toast: null,
  startupFailed: false,
  hydrate: () => {
    if (get().ready) return Promise.resolve();
    if (startup) return startup;
    startup = loadDeviceBooks()
      .then((books) => {

        set({ books, ready: true, saved: true, onboarded: Boolean(books.businessName) });
      })
      .catch(() => set({ startupFailed: true }))
      .finally(() => {
        startup = undefined;
      });
    set({ startupFailed: false });
    return startup;
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
  pendingReceipt: null,
  commitEntry: async (entry) => {
    const { pendingReceipt, pendingReversal, restoring, books: previous } = get();
    if (pendingReversal || restoring)
      throw new BooksError("হিসাব সেভ হচ্ছে। একটু পরে চেষ্টা করুন।");
    if (pendingReceipt) {
      if (pendingReceipt.entryId === entry.id) return pendingReceipt.done;
      throw new BooksError("আগের হিসাব সেভ হচ্ছে। একটু অপেক্ষা করুন।");
    }
    const books = apply(previous, entry);
    const done = persistChain
      .then(async () => {
        await writeConfirmedBooks(previous, books);

        const nav = get().nav.filter(
          (screen) =>
            screen.id !== "flow" && !(screen.id === "receipt" && screen.entryId === entry.id),
        );
        nav.push({ id: "receipt", entryId: entry.id });
        set({ books, saved: true, nav, draft: null, toast: "হিসাব সেভ হয়েছে" });
      })
      .finally(() => set({ pendingReceipt: null }));
    // A failed confirmation must not block the next attempt.
    persistChain = done.catch(() => undefined);
    set({ pendingReceipt: { entryId: entry.id, done }, toast: null });
    return done;
  },
  addParty: async (name, role, phone?) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("দোকানের নাম লিখুন।");
    const id = `p-${crypto.randomUUID()}`;
    const party: Party = {
      id,
      name: trimmed,
      aliases: [trimmed],
      role,
      phone: phone?.trim() || undefined,
    };
    const books = { ...get().books, parties: [...get().books.parties, party] };
    await commitCatalog(books);
    return id;
  },
  addProduct: async (input) => {
    const name = input.name.trim();
    if (!name) throw new Error("মালের নাম লিখুন।");
    if (!Number.isInteger(input.packSize) || input.packSize < 1)
      throw new Error("কেসে কত পিস, সেটা বলুন।");
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
    await commitCatalog(books, { toast: "মাল যোগ হয়েছে" });
    return id;
  },
  editParty: (id, patch) => {
    const books = get().books;
    const party = books.parties.find((p) => p.id === id);
    if (!party) throw new Error("দোকান পাওয়া যায়নি।");
    const next = books.parties.map((p) => (p.id === id ? { ...p, ...patch } : p));
    return commitCatalog({ ...books, parties: next });
  },
  archiveParty: (id) => {
    const books = get().books;
    const party = books.parties.find((p) => p.id === id);
    if (!party) throw new Error("দোকান পাওয়া যায়নি।");
    const next = books.parties.map((p) => (p.id === id ? { ...p, archived: true } : p));
    return commitCatalog({ ...books, parties: next });
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
    return commitCatalog({ ...books, products: next });
  },
  archiveProduct: (id) => {
    const books = get().books;
    const product = books.products.find((p) => p.id === id);
    if (!product) throw new Error("মাল পাওয়া যায়নি।");
    const next = books.products.map((p) => (p.id === id ? { ...p, archived: true } : p));
    return commitCatalog({ ...books, products: next });
  },
  setMode: (mode) => {
    const books = { ...get().books, mode };
    return commitCatalog(books);
  },
  setOnboarded: (value) => set({ onboarded: value }),
  createBusiness: async (name, cashPaisa) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("দোকানের নাম লিখুন।");
    const books = { ...get().books, businessName: trimmed };
    let opened = books;
    if (cashPaisa > 0) {
      opened = apply(
        books,
        buildOpening({
          id: `open-${crypto.randomUUID()}`,
          at: Date.now(),
          cashPaisa,
          stock: [],
          products: [],
        }),
      );
    }
    await commitCatalog(opened, { onboarded: true });
  },
  pendingReversal: null,
  reverseEntry: async (entryId, reason) => {
    const { books, pendingReversal, pendingReceipt, restoring } = get();
    if (pendingReversal?.originalId === entryId) return pendingReversal.done;
    if (pendingReversal || pendingReceipt || restoring) {
      throw new BooksError("হিসাব সেভ হচ্ছে। একটু পরে চেষ্টা করুন।");
    }
    const original = books.entries.find((e) => e.id === entryId);
    if (!original) throw new Error("হিসাব পাওয়া যায়নি।");
    const trimmed = reason.trim();
    if (!trimmed) throw new Error("বিলোপের কারণ লিখুন।");
    const reversal = buildReversal({
      id: `rev-${crypto.randomUUID()}`,
      at: Date.now(),
      original,
      reason: trimmed,
    });
    const next = apply(books, reversal);
    const done = persistChain
      .then(async () => {
        await writeConfirmedBooks(books, next);

        set({ books: next, saved: true, toast: "হিসাব বিলোপ করা হয়েছে" });
      })
      .finally(() => set({ pendingReversal: null }));
    persistChain = done.catch(() => undefined);
    set({ pendingReversal: { originalId: entryId, done }, toast: null });
    return done;
  },
  exportBooks: () => {
    return JSON.stringify(get().books, null, 2);
  },
  restoring: false,
  importBooks: async (source) => {
    const { books: previous, restoring, pendingReceipt, pendingReversal } = get();
    if (restoring || pendingReceipt || pendingReversal)
      throw new BooksError("হিসাব সেভ হচ্ছে। একটু পরে চেষ্টা করুন।");
    set({ restoring: true, toast: null });
    try {
      const raw =
        typeof source === "string"
          ? source
          : await source.text().catch(() => {
              throw new BooksError("ব্যাকআপ ফাইলটি পড়া যায়নি।");
            });
      const books = parseBackup(raw);
      const done = persistChain.then(async () => {
        await writeConfirmedBooks(previous, books);

        set({
          books,
          saved: true,
          onboarded: Boolean(books.businessName),
          toast: "ব্যাকআপ ফেরত আনা হয়েছে",
        });
      });
      persistChain = done.catch(() => undefined);
      await done;
    } finally {
      set({ restoring: false });
    }
  },
  resetDemo: () => {
    const books = makeSeed();
    return commitCatalog(books, {
      nav: [{ id: "home" }],
      draft: null,
      toast: "ডেমো হিসাব আবার বসানো হয়েছে",
    });
  },
  dismissToast: () => set({ toast: null }),
}));
