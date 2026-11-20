import { beforeEach, describe, expect, it, vi } from "vitest";
import { balance, buildCollection } from "./engine.ts";
import { blankDraft } from "./flow.ts";
import { makeSeed } from "./seed.ts";
import { useHishab } from "./store.ts";
import type { Books } from "./types.ts";

const db = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("idb", () => ({ openDB: async () => db }));

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

const initial = useHishab.getInitialState();
const draft = blankDraft("collection", { step: "confirm", partyId: "rahim", amountTaka: 600 });
let disk: Books;
let completion: Promise<void>;
let puts: number;

function due(books: Books) {
  return balance(books, "receivable", "rahim");
}

function collection() {
  return buildCollection(useHishab.getState().books, {
    id: "receipt-600", at: 1, partyId: "rahim", amountPaisa: 60_000,
  });
}

beforeEach(() => {
  disk = makeSeed();
  completion = Promise.resolve();
  puts = 0;
  db.transaction.mockImplementation(() => {
    let staged: Books | undefined;
    const gate = completion;
    return {
      objectStore: () => ({
        get: async () => structuredClone(disk),
        put: async (value: Books) => { staged = structuredClone(value); puts++; },
      }),
      get done() {
        return gate.then(() => { if (staged) disk = staged; });
      },
    };
  });
  useHishab.setState({ ...initial, books: structuredClone(disk), ready: true }, true);
  useHishab.getState().openDraft(draft);
});

describe("durable collection receipts", () => {
  it("keeps the balance and confirmation screen until commit, even on a double tap", async () => {
    const gate = deferred();
    completion = gate.promise;
    const before = due(disk);
    const entry = collection();
    const first = useHishab.getState().commitEntry(entry);
    const second = useHishab.getState().commitEntry(entry);
    await vi.waitFor(() => expect(puts).toBeGreaterThan(0));
    try {
      const pending = useHishab.getState();
      expect(pending.nav.at(-1)?.id).toBe("flow");
      expect(pending.draft).toEqual(draft);
      expect(due(pending.books)).toBe(before);
      expect(pending.toast).not.toBe("হিসাব সেভ হয়েছে");
    } finally {
      gate.resolve();
    }
    await Promise.all([first, second]);
    expect(puts).toBe(1);
    expect(useHishab.getState().nav.filter(s => s.id === "receipt")).toHaveLength(1);
    expect(due(disk)).toBe(before - 60_000);
  });

  it("keeps a failed draft and reloads exactly one payment after retry", async () => {
    const before = due(disk);
    const gate = deferred();
    completion = gate.promise;
    const entry = collection();
    const failed = useHishab.getState().commitEntry(entry);
    await vi.waitFor(() => expect(puts).toBe(1));
    const failure = expect(failed).rejects.toThrow(/আবার চেষ্টা/);
    gate.reject(new Error("transaction aborted"));
    await failure;

    const after = useHishab.getState();
    expect(after.draft).toEqual(draft);
    expect(after.nav.at(-1)?.id).toBe("flow");
    expect(due(after.books)).toBe(before);
    expect(disk.entries.some(row => row.id === entry.id)).toBe(false);

    completion = Promise.resolve();
    await after.commitEntry(entry);
    expect(useHishab.getState().nav.at(-1)).toEqual({ id: "receipt", entryId: entry.id });
    useHishab.setState(initial, true);
    await useHishab.getState().hydrate();
    const restored = useHishab.getState().books;
    expect(restored.entries.filter(row => row.id === entry.id)).toHaveLength(1);
    expect(due(restored)).toBe(before - 60_000);
  });

  it("preserves newer on-device books when confirmation has a stale snapshot", async () => {
    const entry = collection();
    disk = { ...disk, businessName: "অন্য ট্যাবের পরিবর্তন" };
    await expect(useHishab.getState().commitEntry(entry)).rejects.toThrow();
    expect(puts).toBe(0);
    expect(disk.businessName).toBe("অন্য ট্যাবের পরিবর্তন");
    expect(useHishab.getState().draft).toEqual(draft);
  });
});
