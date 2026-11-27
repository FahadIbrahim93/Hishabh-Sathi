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
  ["দে{r} শো", 150],
  ["আ{r}াই শ", 250],
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
      expect(normalizeText(parsed.notes.join(" "))).toContain(normalizeText("পুরো সংখ্যায়"));
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

  for (const [label, rr] of SPELLINGS) {
    it.each(
      (
        [
          ["পাঁচ লাখ আ{r}াই হাজার", 502_500],
          ["বারো লাখ দে{r} হাজার", 1_201_500],
          ["এক লাখ সা{r}ে তিন হাজার", 103_500],
        ] as const
      ).map(([amount, taka]) => [spell(amount, rr), taka] as const),
    )(`reads a long amount after the verb whole: %s (${label})`, (amount, taka) => {
      const parsed = parseUtterance(`করিমের কাছ থেকে পেয়েছি ${spell(amount, rr)} টাকা`, books);
      expect(parsed.kind).toBe("collection");
      expect(parsed.receivedTaka).toBe(taka);
    });

    it(`reads a long price after প্রতি whole (${label})`, () => {
      const parsed = parseUtterance(
        spell(
          "রহিম স্টোরে এক কেস লাইটার বিক্রি করেছি। প্রতি কেস দাম হিসাবে ধরলাম তেরো হাজার দে{r}শো টাকা।",
          rr,
        ),
        books,
      );
      expect(parsed.unitPriceTaka).toBe(13_150);
    });

    it(`does not read a fraction in a product or shop name as an amount (${label})`, () => {
      const named: typeof books = {
        ...books,
        parties: [
          ...books.parties,
          { id: "arai", name: spell("আ{r}াই হাজারী স্টোর", rr), aliases: [], role: "customer" },
        ],
        products: [
          ...books.products,
          { ...books.products[0]!, id: "coke", name: spell("দে{r} লিটার কোক", rr), aliases: [] },
        ],
      };
      const sale = parseUtterance(
        spell("রহিম স্টোরে দুই কেস দে{r} লিটার কোক বিক্রি করেছি", rr),
        named,
      );
      expect(sale.kind).toBe("sale");
      expect(sale.productId).toBe("coke");
      expect(sale.qtyInput).toBe(2);
      const paid = parseUtterance(spell("আ{r}াই হাজারী স্টোর থেকে পাঁচশ টাকা পেয়েছি", rr), named);
      expect(paid.kind).toBe("collection");
      expect(paid.partyId).toBe("arai");
      expect(paid.receivedTaka).toBe(500);
    });

    it(`does not read সাড়ে before a clock time as a fraction (${label})`, () => {
      for (const when of ["সা{r}ে ৩টায়", "সা{r}ে ৩ টায়"]) {
        const parsed = parseUtterance(
          `${spell(when, rr)} করিমের কাছ থেকে পাঁচশ টাকা পেয়েছি`,
          books,
        );
        expect(parsed.kind).toBe("collection");
        expect(parsed.receivedTaka).toBe(500);
      }
    });
  }

  it.each(["১.৫ হাজার", "1.5 হাজার", "১.5 লাখ", "১২৫.৫০", "125.00"])(
    "sends decimal amount %s to manual entry",
    (amount) => {
      const parsed = parseUtterance(`করিমের কাছ থেকে ${amount} টাকা পেয়েছি`, books);
      expect(parsed.kind).toBeNull();
      expect(parsed.amountTaka).toBeUndefined();
      expect(parsed.notes.join(" ")).toContain("ফর্মে লিখুন");
    },
  );

  it("keeps a decimal in a matched product name out of the amount check", () => {
    const named: typeof books = {
      ...books,
      products: [
        ...books.products,
        { ...books.products[0]!, id: "coke", name: "১.৫ লিটার কোক", aliases: [] },
      ],
    };
    const parsed = parseUtterance("রহিম স্টোরে দুই কেস ১.৫ লিটার কোক বিক্রি করেছি", named);
    expect(parsed.kind).toBe("sale");
    expect(parsed.productId).toBe("coke");
    expect(parsed.qtyInput).toBe(2);
  });

  it.each([
    ["তিন শো", 300],
    ["সাড়ে তিন শো", 350],
  ] as const)("reads a spoken hundred with a space: %s", (amount, taka) => {
    const parsed = parseUtterance(`করিমের কাছ থেকে ${amount} টাকা পেয়েছি`, books);
    expect(parsed.kind).toBe("collection");
    expect(parsed.receivedTaka).toBe(taka);
  });

  it("reads a digit before হাজার as thousands", () => {
    const parsed = parseUtterance("করিমের কাছ থেকে ৩ হাজার টাকা পেয়েছি", books);
    expect(parsed.kind).toBe("collection");
    expect(parsed.receivedTaka).toBe(3_000);
  });
});
