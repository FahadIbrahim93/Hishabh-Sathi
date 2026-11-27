import { beforeEach, expect, it, vi } from "vitest";
import { useHishab } from "./store.ts";
import { makeSeed } from "./seed.ts";
import type { Books } from "./types.ts";

const db = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("idb", () => ({ openDB: async () => db }));

// Bangla "য়" has two equivalent encodings, so compare normally.
const norm = (value: string) => value.normalize("NFC");
const SAVE_FAILED = norm("সেভ হয়নি");

let disk: Books;
let failWrites: boolean;

function emptyShop(): Books {
  return { version: 1, businessName: "", mode: "stock", parties: [], products: [], entries: [] };
}

async function loadDevice(books: Books) {
  disk = structuredClone(books);
  failWrites = false;
  db.transaction.mockReset();
  db.transaction.mockImplementation(() => {
    let staged: Books | undefined;
    return {
      objectStore: () => ({
        get: async () => structuredClone(disk),
        put: async (value: Books) => {
          if (failWrites) throw new Error("quota exceeded");
          staged = structuredClone(value);
        },
      }),
      get done() {
        if (staged) disk = staged;
        return Promise.resolve();
      },
    };
  });
  useHishab.setState(useHishab.getInitialState(), true);
  // Load through the real startup path so the tab knows what the device holds.
  await useHishab.getState().hydrate();
  expect(useHishab.getState().ready).toBe(true);
}

beforeEach(async () => {
  await loadDevice(makeSeed());
});

it("reports a failed catalog write instead of claiming the shop was saved", async () => {
  failWrites = true;
  const before = disk.parties.length;
  const saving = useHishab.getState().addParty("নতুন দোকান", "customer");
  expect(useHishab.getState().books.parties).toHaveLength(before);
  await expect(saving).rejects.toThrow();
  expect(useHishab.getState().books.parties).toHaveLength(before);
  await vi.waitFor(() => expect(useHishab.getState().saved).toBe(false));
  expect(norm(useHishab.getState().toast ?? "")).toContain(SAVE_FAILED);
  expect(disk.parties).toHaveLength(before);
});

it("persists a catalog write that the device accepted", async () => {
  const id = await useHishab.getState().addParty("ভালো দোকান", "customer");
  await vi.waitFor(() => expect(disk.parties.some((party) => party.id === id)).toBe(true));
  expect(useHishab.getState().saved).toBe(true);
});

it("refuses a catalog write built on a stale tab and keeps the newer books", async () => {
  const party = disk.parties[0];
  const originalName = party.name;
  disk = { ...disk, businessName: "অন্য ট্যাবের নাম" };
  await expect(useHishab.getState().editParty(party.id, { name: "পুরোনো ট্যাবের নাম" })).rejects.toThrow();
  expect(useHishab.getState().books.parties[0].name).toBe(originalName);
  await vi.waitFor(() => expect(useHishab.getState().saved).toBe(false));
  expect(norm(useHishab.getState().toast ?? "")).toMatch(/বদলেছে|সেভ হয়নি/);
  expect(disk.businessName).toBe("অন্য ট্যাবের নাম");
  expect(disk.parties.find((row) => row.id === party.id)?.name).toBe(originalName);
});

it("does not finish onboarding when the first shop write fails", async () => {
  await loadDevice(emptyShop());
  failWrites = true;
  const error = await useHishab
    .getState()
    .createBusiness("নতুন দোকান", 50_000)
    .then(
      () => undefined,
      (reason: unknown) => reason,
    );
  expect(error).toBeInstanceOf(Error);
  expect(norm(String(error instanceof Error ? error.message : error))).toContain(SAVE_FAILED);
  expect(useHishab.getState().onboarded).toBe(false);
  expect(useHishab.getState().saved).toBe(false);
  expect(useHishab.getState().books.businessName).toBe("");
  expect(disk.businessName).toBe("");
});

it("requires a readable backup of the live books before resetting", async () => {
  const original = useHishab.getState().exportBooks();
  const unreadable = new Blob([original]);
  vi.spyOn(unreadable, "text").mockRejectedValueOnce(new Error("read failed"));
  const { resetDemo } = useHishab.getState();
  await expect(resetDemo(unreadable)).rejects.toThrow();
  await expect(resetDemo(new Blob(["{}"]))).rejects.toThrow();
  await useHishab.getState().addParty("নতুন দোকান", "customer");
  const current = useHishab.getState().books;
  await expect(resetDemo(new Blob([original]))).rejects.toThrow();
  expect(disk).toEqual(current);
  expect(useHishab.getState().books).toEqual(current);
});

it("preserves a newer tab's books during demo reset", async () => {
  const backup = new Blob([useHishab.getState().exportBooks()]);
  disk = { ...disk, businessName: "অন্য ট্যাবের নাম" };
  await expect(useHishab.getState().resetDemo(backup)).rejects.toThrow();
  expect(disk.businessName).toBe("অন্য ট্যাবের নাম");
});

it("starts demo on an empty device and refuses to replace existing books from onboarding", async () => {
  await loadDevice(emptyShop());
  await useHishab.getState().startDemo();
  expect(useHishab.getState().onboarded).toBe(true);
  const current = disk;
  await expect(useHishab.getState().startDemo()).rejects.toThrow();
  expect(disk).toEqual(current);
});
