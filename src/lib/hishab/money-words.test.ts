import { describe, expect, it } from "vitest";
import { normalizeText, scanAmounts } from "./money.ts";
import { parseUtterance } from "./parser.ts";
import { makeSeed } from "./seed.ts";

// "ড়" reaches us in two spellings: the precomposed letter U+09DC (most
// keyboards) and ড + nukta U+09A1 U+09BC (what NFC normalisation and some
// speech engines produce). Every phrase below is checked in both.
const SPELLINGS = [
  ["precomposed", "ড়"],
  ["decomposed", "ড়"],
] as const;

function spell(phrase: string, rr: string): string {
  return phrase.replaceAll("{r}", rr);
}

function values(phrase: string): number[] {
  return scanAmounts(normalizeText(phrase)).map((hit) => hit.value);
}

// How a shopkeeper says an amount, and the taka it means.
const SPOKEN: [string, number][] = [
  ["দে{r} হাজার", 1_500],
  ["দে{r}শ", 150],
  ["দে{r}শো", 150],
  ["দে{r} লাখ", 150_000],
  ["আ{r}াই হাজার", 2_500],
  ["আ{r}াইশ", 250],
  ["আ{r}াইশো", 250],
  ["আ{r}াই লাখ", 250_000],
  ["সা{r}ে তিন হাজার", 3_500],
  ["সা{r}ে তিনশ", 350],
  ["সা{r}ে তিনশো", 350],
  ["সা{r}ে পাঁচ লাখ", 550_000],
  ["সা{r}ে বারো হাজার", 12_500],
  ["সা{r}ে ৩ হাজার", 3_500],
  ["সা{r}ে ৩শ", 350],
  ["দুই হাজার দে{r}শ", 2_150],
  ["এক লাখ আ{r}াই হাজার", 102_500],
];

// A digit before হাজার/লাখ is how speech engines often write the number.
const DIGITS: [string, number][] = [
  ["৩ হাজার", 3_000],
  ["১২ হাজার", 12_000],
  ["২ লাখ", 200_000],
  ["3 হাজার", 3_000],
  ["৫শ", 500],
  ["৫শো টাকা", 500],
];

// Phrases that already worked must keep their value.
const UNCHANGED: [string, number][] = [
  ["তিন হাজার", 3_000],
  ["পাঁচশ", 500],
  ["ছয়শো", 600],
  ["বারো হাজার চারশ", 12_400],
  ["৫০০", 500],
];

describe("Bangla fraction words in spoken amounts", () => {
  for (const [label, rr] of SPELLINGS) {
    describe(`with ${label} ড়`, () => {
      it.each(SPOKEN.map(([phrase, taka]) => [spell(phrase, rr), taka] as const))(
        "%s is %d taka",
        (phrase, taka) => {
          expect(values(phrase)).toEqual([taka]);
        },
      );

      it.each(
        [
          ["সা{r}ে তিন", 3.5],
          ["দে{r}", 1.5],
          ["আ{r}াই", 2.5],
        ].map(([phrase, value]) => [spell(phrase as string, rr), value as number] as const),
      )("bare %s reads as %d, never as the whole number beside it", (phrase, value) => {
        expect(values(phrase)).toEqual([value]);
      });
    });
  }

  it.each(DIGITS)("%s is %d taka", (phrase, taka) => {
    expect(values(phrase)).toEqual([taka]);
  });

  it.each(UNCHANGED)("%s still reads as %d", (phrase, taka) => {
    expect(values(phrase)).toEqual([taka]);
  });
});

describe("voice drafts carry fraction amounts exactly", () => {
  const books = makeSeed(new Date(2026, 10, 9, 15, 0, 0, 0).getTime());

  for (const [label, rr] of SPELLINGS) {
    it(`reads দেড় হাজার in a collection (${label})`, () => {
      const parsed = parseUtterance(spell("করিমের কাছ থেকে দে{r} হাজার টাকা পেয়েছি", rr), books);
      expect(parsed.kind).toBe("collection");
      expect(parsed.partyId).toBe("karim");
      expect(parsed.receivedTaka).toBe(1_500);
    });

    it(`reads আড়াই হাজার as an expense (${label})`, () => {
      const parsed = parseUtterance(spell("দোকানের বিদ্যুৎ বিল আ{r}াই হাজার টাকা খরচ", rr), books);
      expect(parsed.kind).toBe("expense");
      expect(parsed.amountTaka).toBe(2_500);
    });

    it(`refuses a half-taka price instead of rounding it (${label})`, () => {
      const parsed = parseUtterance(
        spell(
          "রহিম স্টোরে দুই কেস লাইটার বিক্রি করেছি। প্রতি পিস সা{r}ে তিন টাকা। ছয়শ টাকা পেয়েছি।",
          rr,
        ),
        books,
      );
      expect(parsed.kind).toBeNull();
      expect(parsed.unitPriceTaka).toBeUndefined();
      expect(parsed.notes.join(" ")).toMatch(/পুরো সংখ্যায়/);
    });
  }

  // Spelled with escapes so the test does not depend on how an editor stores য়.
  const SIX_HUNDRED = {
    precomposed: "ছয়শো", // ছ য় শ ো
    decomposed: "ছয়শো", // ছ য ় শ ো
  };
  const RECEIVED = {
    precomposed: "পেয়েছি", // পেয়েছি
    decomposed: "পেয়েছি",
  };

  for (const label of ["precomposed", "decomposed"] as const) {
    it(`reads ছয়শো and পেয়েছি whichever way য় is encoded (${label})`, () => {
      expect(values(SIX_HUNDRED[label])).toEqual([600]);
      const parsed = parseUtterance(
        `করিমের কাছ থেকে ${SIX_HUNDRED[label]} টাকা ${RECEIVED[label]}`,
        books,
      );
      expect(parsed.kind).toBe("collection");
      expect(parsed.receivedTaka).toBe(600);
    });
  }

  it("reads a digit before হাজার as thousands", () => {
    const parsed = parseUtterance("করিমের কাছ থেকে ৩ হাজার টাকা পেয়েছি", books);
    expect(parsed.kind).toBe("collection");
    expect(parsed.receivedTaka).toBe(3_000);
  });
});
