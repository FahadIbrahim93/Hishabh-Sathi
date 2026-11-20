import { beforeEach, expect, it, vi } from "vitest";
import { useHishab } from "./store.ts";
import { makeSeed } from "./seed.ts";
import type { Books } from "./types.ts";

const db = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("idb", () => ({ openDB: async () => db }));

let disk: Books;
const put = vi.fn();
beforeEach(() => {
  disk = makeSeed();
  put.mockReset();
  db.transaction.mockClear();
  db.transaction.mockImplementation(() => ({
    objectStore: () => ({ get: async () => structuredClone(disk), put }),
    done: Promise.resolve(),
  }));
  useHishab.setState({ ...useHishab.getInitialState(), books: structuredClone(disk), ready: true }, true);
});

const corruptions: [string, (books: Books) => void][] = [
  ["unbalanced entry", b => { b.entries[0].lines[0].debit += 1; }],
  ["offsetting errors in different entries", b => {
    b.entries[0].lines[0].debit += 1;
    b.entries[1].lines[0].credit += 1;
  }],
  ["fractional paisa", b => { b.products[0].pricePaisa = 0.5; }],
  ["duplicate entry ID", b => { b.entries[1].id = b.entries[0].id; }],
  ["missing party", b => { b.entries[1].partyId = "missing-party"; }],
  ["unknown stock location", b => { b.entries[0].stock[0].location = "missing-location"; }],
  ["malformed stock move", b => { b.entries[0].stock[0].qtyDelta = 0; }],
  ["malformed catalog record", b => { Object.assign(b.parties[0], { aliases: null }); }],
  ["unknown account", b => { Object.assign(b.entries[0].lines[0], { account: "unknown" }); }],
  ["missing reversal target", b => { b.entries[0].kind = "reversal"; }],
  ["unsafe amount", b => { b.entries[0].lines[0].debit = Number.MAX_SAFE_INTEGER + 1; }],
];

it.each(corruptions)("rejects %s before issuing a device write", async (_, corrupt) => {
  const original = structuredClone(disk);
  const backup = structuredClone(disk);
  corrupt(backup);
  await expect(async () => useHishab.getState().importBooks(JSON.stringify(backup))).rejects.toThrow(/ব্যাকআপ/);
  expect(db.transaction).not.toHaveBeenCalled();
  expect(useHishab.getState().books).toEqual(original);
  expect(disk).toEqual(original);
});

it("rejects unreadable JSON and unsupported versions", async () => {
  for (const raw of ["{", JSON.stringify({ ...disk, version: 2 })]) {
    await expect(async () => useHishab.getState().importBooks(raw)).rejects.toThrow(/ব্যাকআপ/);
  }
  expect(put).not.toHaveBeenCalled();
});

it("rejects a stale restore when another tab has changed the device books", async () => {
  const backup = useHishab.getState().exportBooks();
  disk = { ...disk, businessName: "অন্য ট্যাব" };
  await expect(async () => useHishab.getState().importBooks(backup)).rejects.toThrow();
  expect(put).not.toHaveBeenCalled();
  expect(disk.businessName).toBe("অন্য ট্যাব");
});
