import { beforeEach, expect, it, vi } from "vitest";
import { makeSeed } from "./seed.ts";
import { useHishab } from "./store.ts";
import type { Books } from "./types.ts";

const db = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("idb", () => ({ openDB: async () => db }));

const legacy = { getItem: vi.fn(), removeItem: vi.fn() };
const read = vi.fn<() => Promise<Books | undefined>>();
const write = vi.fn();
const existing = makeSeed();

beforeEach(() => {
  useHishab.setState(useHishab.getInitialState(), true);
  vi.resetAllMocks();
  vi.stubGlobal("localStorage", legacy);
  legacy.getItem.mockReturnValue(null);
  db.transaction.mockImplementation(() => ({
    objectStore: () => ({ get: read, add: write, put: write }),
    done: Promise.resolve(),
  }));
});

it("writes nothing after a failed read and recovers the exact books on retry", async () => {
  read.mockRejectedValueOnce(new Error("read failed")).mockResolvedValue(existing);
  await useHishab.getState().hydrate();
  expect(write).not.toHaveBeenCalled();
  expect(legacy.getItem).not.toHaveBeenCalled();
  expect(useHishab.getState().ready).toBe(false);

  await useHishab.getState().hydrate();
  expect(useHishab.getState().books).toEqual(existing);
  expect(useHishab.getState().onboarded).toBe(true);
  expect(write).not.toHaveBeenCalled();
});

it("allows first-time onboarding when device and legacy storage are empty", async () => {
  read.mockResolvedValue(undefined);
  await useHishab.getState().hydrate();
  expect(useHishab.getState()).toMatchObject({ ready: true, onboarded: false, books: { entries: [] } });
});

it("keeps an unreadable legacy record intact", async () => {
  read.mockResolvedValue(undefined);
  legacy.getItem.mockReturnValue("{broken");
  await useHishab.getState().hydrate();
  expect(write).not.toHaveBeenCalled();
  expect(legacy.removeItem).not.toHaveBeenCalled();
  expect(useHishab.getState().ready).toBe(false);
});

it("keeps legacy books when migration fails and migrates on retry", async () => {
  read.mockResolvedValue(undefined);
  legacy.getItem.mockReturnValue(JSON.stringify(existing));
  write.mockImplementationOnce(() => { throw new Error("quota"); });
  await useHishab.getState().hydrate();
  expect(legacy.removeItem).not.toHaveBeenCalled();
  expect(useHishab.getState().ready).toBe(false);
  await useHishab.getState().hydrate();
  expect(useHishab.getState().books).toEqual(existing);
  expect(legacy.removeItem).toHaveBeenCalledOnce();
});
