import { expect, it } from "vitest";
import { parseBackup } from "./backup.ts";
import { apply, balance, buildCollection, buildReversal } from "./engine.ts";
import { makeSeed } from "./seed.ts";

it("allows one correction per collection across payment sizes and retry IDs", () => {
  const books = makeSeed();
  const due = balance(books, "receivable", "rahim");
  for (const amountPaisa of [1, 60_000, due, ...Array.from({ length: 64 }, (_, i) => 1 + i * 7919 % due)]) {
    const original = buildCollection(books, { id: "paid", at: 1, partyId: "rahim", amountPaisa });
    const paid = apply(books, original);
    const correction = buildReversal({ id: "first", at: 2, original, reason: "ভুল অঙ্ক" });
    const corrected = apply(paid, correction);

    expect(balance(corrected, "receivable", "rahim")).toBe(due);
    expect(balance(corrected, "cash")).toBe(balance(books, "cash"));
    expect(apply(corrected, correction)).toBe(corrected);
    expect(() => apply(corrected, { ...correction, id: "retry" })).toThrow(/আগেই বিলোপ/);
    expect(corrected.entries.filter(entry => entry.reversesEntryId === original.id)).toHaveLength(1);
  }
});

it("rejects a backup with two corrections linked to one original", () => {
  const books = makeSeed();
  const original = buildCollection(books, { id: "paid", at: 1, partyId: "rahim", amountPaisa: 60_000 });
  const correction = buildReversal({ id: "first", at: 2, original, reason: "ভুল অঙ্ক" });
  const corrected = apply(apply(books, original), correction);
  expect(parseBackup(JSON.stringify(corrected))).toEqual(JSON.parse(JSON.stringify(corrected)));
  const duplicate = { ...corrected, entries: [...corrected.entries, { ...correction, id: "retry" }] };
  expect(() => parseBackup(JSON.stringify(duplicate))).toThrow(/বিলোপ/);
});
