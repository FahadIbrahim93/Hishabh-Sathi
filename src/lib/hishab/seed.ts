import { apply, buildConsign, buildOpening, buildSale } from "./engine.ts";
import { startOfLocalDay } from "./money.ts";
import type { Books, Party, Product } from "./types.ts";

const DAY = 86_400_000;
const HOUR = 3_600_000;

function earlierToday(now: number, preferHour: number, fallbackMs: number): number {
  const start = startOfLocalDay(now);
  const prefer = start + preferHour * HOUR;
  if (prefer < now) return prefer;
  return Math.max(start + 1000, now - fallbackMs);
}

export function makeSeed(now = Date.now()): Books {
  const parties: Party[] = [
    {
      id: "rahim",
      name: "রহিম স্টোর",
      aliases: ["রহিম স্টোর", "রহিম স্টোরে", "রহিমের দোকান", "রহিমের দোকানে", "রহিম"],
      role: "customer",
    },
    {
      id: "karim",
      name: "করিম স্টোর",
      aliases: ["করিম স্টোর", "করিমের কাছ", "করিমের দোকান", "করিম"],
      role: "customer",
    },
    {
      id: "nur",
      name: "নুরের দোকান",
      aliases: ["নুরের দোকান", "নুরের দোকানে", "নুর"],
      role: "customer",
    },
    {
      id: "salma",
      name: "সালমা স্টোর",
      aliases: ["সালমা স্টোর", "সালমার দোকান", "সালমা"],
      role: "customer",
    },
    {
      id: "kamal",
      name: "কামাল ট্রেডার্স",
      aliases: ["কামাল ট্রেডার্স", "কামাল"],
      role: "supplier",
    },
  ];
  const products: Product[] = [
    {
      id: "lighter",
      name: "লাইটার",
      aliases: ["লাইটার", "লাইটারের"],
      packName: "কেস",
      packSize: 50,
      pricePaisa: 1000,
      costPaisa: 600,
    },
    {
      id: "soap",
      name: "সাবান",
      aliases: ["সাবান"],
      packName: "প্যাকেট",
      packSize: 12,
      pricePaisa: 2500,
      costPaisa: 1800,
    },
  ];

  let books: Books = {
    version: 1,
    businessName: "রফিক ট্রেডার্স",
    mode: "stock",
    parties,
    products,
    entries: [],
  };

  books = apply(
    books,
    buildOpening({
      id: "seed-open",
      at: now - 6 * DAY,
      cashPaisa: 500_000,
      products,
      stock: [
        { productId: "lighter", qty: 3970, costPaisa: 600 },
        { productId: "soap", qty: 120, costPaisa: 1800 },
      ],
    }),
  );
  books = apply(
    books,
    buildSale(books, {
      id: "seed-rahim",
      at: now - 5 * DAY,
      partyId: "rahim",
      productId: "lighter",
      qty: 800,
      unitPricePaisa: 1000,
      receivedPaisa: 0,
    }),
  );
  books = apply(
    books,
    buildSale(books, {
      id: "seed-salma",
      at: now - 3 * DAY,
      partyId: "salma",
      productId: "lighter",
      qty: 370,
      unitPricePaisa: 1000,
      receivedPaisa: 0,
    }),
  );
  books = apply(
    books,
    buildConsign(books, {
      id: "seed-consign",
      at: now - 2 * DAY,
      partyId: "rahim",
      productId: "lighter",
      qty: 50,
    }),
  );
  books = apply(
    books,
    buildSale(books, {
      id: "seed-karim",
      at: earlierToday(now, 9, 90 * 60_000),
      partyId: "karim",
      productId: "lighter",
      qty: 150,
      unitPricePaisa: 1000,
      receivedPaisa: 100_000,
    }),
  );
  books = apply(
    books,
    buildSale(books, {
      id: "seed-nur",
      at: earlierToday(now, 11, 30 * 60_000),
      partyId: "nur",
      productId: "lighter",
      qty: 100,
      unitPricePaisa: 1000,
      receivedPaisa: 80_000,
    }),
  );
  return books;
}
