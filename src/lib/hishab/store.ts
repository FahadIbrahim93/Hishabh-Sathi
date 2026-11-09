import { create } from "zustand";
import { apply, buildStockAdd } from "./engine.ts";
import { makeSeed } from "./seed.ts";
import { takaToPaisa } from "./money.ts";
import type { Books, Draft, Entry, Mode, Party, Product } from "./types.ts";

const KEY = "hishab-sathi-v1";

export type TabId = "home" | "dues" | "stock" | "more";

export type Screen =
  | { id: TabId }
  | { id: "visit" }
  | { id: "shop"; partyId: string }
  | { id: "ledger" }
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
  saved: boolean;
  toast: string | null;
  hydrate: () => void;
  goTab: (id: TabId) => void;
  push: (screen: Screen) => void;
  back: () => void;
  openDraft: (draft: Draft) => void;
  patchDraft: (patch: Partial<Draft>) => void;
  flowBack: (step: Draft["step"] | "exit") => void;
  commitEntry: (entry: Entry) => void;
  addParty: (name: string, role: Party["role"]) => string;
  addProduct: (input: NewProduct) => string;
  setMode: (mode: Mode) => void;
  resetDemo: () => void;
  dismissToast: () => void;
}

function emptyBooks(): Books {
  return { version: 1, businessName: "", mode: "stock", parties: [], products: [], entries: [] };
}

function persist(books: Books): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(books));
    return true;
  } catch {
    return false;
  }
}

function readBooks(): Books | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const books = JSON.parse(raw) as Books;
    if (books.version !== 1 || !Array.isArray(books.entries) || !Array.isArray(books.parties)) return null;
    return books;
  } catch {
    return null;
  }
}

export const useHishab = create<HishabState>((set, get) => ({
  books: emptyBooks(),
  nav: [{ id: "home" }],
  draft: null,
  ready: false,
  saved: true,
  toast: null,
  hydrate: () => {
    if (get().ready) return;
    const stored = readBooks();
    const books = stored ?? makeSeed();
    const saved = persist(books);
    set({ books, ready: true, saved });
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
    const saved = persist(books);
    const nav = get().nav.filter((screen) => screen.id !== "flow");
    nav.push({ id: "receipt", entryId: entry.id });
    set({ books, saved, nav, draft: null, toast: "হিসাব সেভ হয়েছে" });
  },
  addParty: (name, role) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("দোকানের নাম লিখুন।");
    const id = `p-${crypto.randomUUID()}`;
    const party: Party = { id, name: trimmed, aliases: [trimmed], role };
    const books = { ...get().books, parties: [...get().books.parties, party] };
    set({ books, saved: persist(books) });
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
    set({ books, saved: persist(books), toast: "মাল যোগ হয়েছে" });
    return id;
  },
  setMode: (mode) => {
    const books = { ...get().books, mode };
    set({ books, saved: persist(books) });
  },
  resetDemo: () => {
    const books = makeSeed();
    set({
      books,
      saved: persist(books),
      nav: [{ id: "home" }],
      draft: null,
      toast: "ডেমো হিসাব আবার বসানো হয়েছে",
    });
  },
  dismissToast: () => set({ toast: null }),
}));
