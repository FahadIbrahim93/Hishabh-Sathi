const BN = "০১২৩৪৫৬৭৮৯";

const N99 = [
  "",
  "এক",
  "দুই",
  "তিন",
  "চার",
  "পাঁচ",
  "ছয়",
  "সাত",
  "আট",
  "নয়",
  "দশ",
  "এগারো",
  "বারো",
  "তেরো",
  "চৌদ্দ",
  "পনেরো",
  "ষোলো",
  "সতেরো",
  "আঠারো",
  "উনিশ",
  "বিশ",
  "একুশ",
  "বাইশ",
  "তেইশ",
  "চব্বিশ",
  "পঁচিশ",
  "ছাব্বিশ",
  "সাতাশ",
  "আঠাশ",
  "ঊনত্রিশ",
  "ত্রিশ",
  "একত্রিশ",
  "বত্রিশ",
  "তেত্রিশ",
  "চৌত্রিশ",
  "পঁয়ত্রিশ",
  "ছত্রিশ",
  "সাঁইত্রিশ",
  "আটত্রিশ",
  "ঊনচল্লিশ",
  "চল্লিশ",
  "একচল্লিশ",
  "বিয়াল্লিশ",
  "তেতাল্লিশ",
  "চুয়াল্লিশ",
  "পঁয়তাল্লিশ",
  "ছেচল্লিশ",
  "সাতচল্লিশ",
  "আটচল্লিশ",
  "ঊনপঞ্চাশ",
  "পঞ্চাশ",
  "একান্ন",
  "বাহান্ন",
  "তিপ্পান্ন",
  "চুয়ান্ন",
  "পঞ্চান্ন",
  "ছাপ্পান্ন",
  "সাতান্ন",
  "আটান্ন",
  "ঊনষাট",
  "ষাট",
  "একষট্টি",
  "বাষট্টি",
  "তেষট্টি",
  "চৌষট্টি",
  "পঁয়ষট্টি",
  "ছেষট্টি",
  "সাতষট্টি",
  "আটষট্টি",
  "ঊনসত্তর",
  "সত্তর",
  "একাত্তর",
  "বাহাত্তর",
  "তিয়াত্তর",
  "চুয়াত্তর",
  "পঁচাত্তর",
  "ছিয়াত্তর",
  "সাতাত্তর",
  "আটাত্তর",
  "ঊনআশি",
  "আশি",
  "একাশি",
  "বিরাশি",
  "তিরাশি",
  "চুরাশি",
  "পঁচাশি",
  "ছিয়াশি",
  "সাতাশি",
  "আটাশি",
  "ঊননব্বই",
  "নব্বই",
  "একানব্বই",
  "বিরানব্বই",
  "তিরানব্বই",
  "চুরানব্বই",
  "পঁচানব্বই",
  "ছিয়ানব্বই",
  "সাতানব্বই",
  "আটানব্বই",
  "নিরানব্বই",
];

export function banglaUnder100(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  return N99[n] ?? String(n);
}

export function takaWords(amount: number): string {
  const n = Math.round(amount);
  if (n === 0) return "শূন্য";
  if (n < 0) return `বিয়োগ ${takaWords(-n)}`;
  const parts: string[] = [];
  const crore = Math.floor(n / 10_000_000);
  const lakh = Math.floor((n % 10_000_000) / 100_000);
  const thou = Math.floor((n % 100_000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(`${chunk(crore)} কোটি`);
  if (lakh) parts.push(`${chunk(lakh)} লাখ`);
  if (thou) parts.push(`${chunk(thou)} হাজার`);
  if (rest) parts.push(chunk(rest));
  return parts.join(" ");
}

function chunk(n: number): string {
  if (n < 100) return N99[n] ?? String(n);
  const h = Math.floor(n / 100);
  const r = n % 100;
  const head = h === 1 ? "একশ" : `${N99[h]}শ`;
  return r ? `${head} ${N99[r]}` : head;
}

export function toBnDigits(value: string): string {
  return value.replace(/\d/g, (d) => BN[Number(d)] ?? d);
}

export function toBn(n: number): string {
  return toBnDigits(String(Math.trunc(Math.abs(n))));
}

export function toBnGrouped(n: number): string {
  const sign = n < 0 ? "−" : "";
  const grouped = Math.abs(Math.trunc(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + toBnDigits(grouped);
}

export function formatTaka(paisa: number): string {
  const neg = paisa < 0;
  const abs = Math.abs(Math.round(paisa));
  const taka = Math.floor(abs / 100);
  const poisha = abs % 100;
  const body =
    poisha === 0 ? toBnGrouped(taka) : `${toBnGrouped(taka)}.${toBn(poisha).padStart(2, "০")}`;
  return `${neg ? "−" : ""}৳ ${body}`;
}

export function formatQty(qty: number, packSize = 1, packName = "কেস"): string {
  const abs = Math.abs(Math.trunc(qty));
  const pcs = `${toBnGrouped(abs)} পিস`;
  if (packSize > 1 && abs >= packSize) {
    const packs = Math.floor(abs / packSize);
    const rem = abs % packSize;
    if (rem === 0) return `${toBnGrouped(packs)} ${packName} (${pcs})`;
    return `${toBnGrouped(packs)} ${packName} ${toBnGrouped(rem)} পিস`;
  }
  return pcs;
}

export function takaToPaisa(taka: number): number {
  return Math.round(taka) * 100;
}

/*
 * Parse a numeric string that may carry Bangla or English digits, e.g.
 * "৫০০", "500", "১৫.৫০". Returns NaN for anything that isn't a number.
 * Used everywhere a user types an amount so Bangla digits never silently
 * become NaN (SSOT blocker #7).
 */
export function parseAmount(input: string): number {
  const bangla = "০১২৩৪৫৬৭৮৯";
  const english = "0123456789";
  let normalized = "";
  for (const ch of input) {
    const idx = bangla.indexOf(ch);
    normalized += idx >= 0 ? english[idx] : ch;
  }
  const trimmed = normalized.trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
}

export function startOfLocalDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const MONTHS = [
  "জানু",
  "ফেব",
  "মার্চ",
  "এপ্রি",
  "মে",
  "জুন",
  "জুল",
  "আগ",
  "সেপ",
  "অক্ট",
  "নভে",
  "ডিসে",
];

export function formatWhen(ts: number, now = Date.now()): string {
  const start = startOfLocalDay(now);
  const d = new Date(ts);
  const clock = toBnDigits(
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
  );
  if (ts >= start) return `আজ ${clock}`;
  if (ts >= start - 86_400_000) return `গতকাল ${clock}`;
  return `${toBn(d.getDate())} ${MONTHS[d.getMonth()]}`;
}

export function normalizeText(input: string): string {
  return input
    .replace(/[০-৯]/g, (ch) => String(ch.charCodeAt(0) - 0x09e6))
    .replace(/[।,.!?;:،"'“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type Phrase = { text: string; value: number };

let phraseCache: Phrase[] | null = null;

function phrases(): Phrase[] {
  if (phraseCache) return phraseCache;
  const list: Phrase[] = [];
  for (let n = 1; n <= 99; n += 1) {
    const w = N99[n]!;
    list.push({ text: `${w} লাখ`, value: n * 100_000 });
    list.push({ text: `${w} হাজার`, value: n * 1000 });
    list.push({ text: w, value: n });
  }
  for (let h = 1; h <= 9; h += 1) {
    const stem = h === 1 ? "একশ" : `${N99[h]}শ`;
    list.push({ text: `${stem}ো`, value: h * 100 });
    list.push({ text: stem, value: h * 100 });
  }
  list.push({ text: "লাখ", value: 100_000 }, { text: "হাজার", value: 1000 }, { text: "শত", value: 100 });
  list.sort((a, b) => b.text.length - a.text.length || b.value - a.value);
  phraseCache = list;
  return list;
}

function isBengali(ch: string | undefined): boolean {
  if (!ch) return false;
  const c = ch.codePointAt(0) ?? 0;
  return c >= 0x0980 && c <= 0x09ff;
}

export interface AmountHit {
  value: number;
  start: number;
  end: number;
}

export function scanAmounts(text: string): AmountHit[] {
  const raw: AmountHit[] = [];
  const dict = phrases();
  let i = 0;
  while (i < text.length) {
    const digit = /^[0-9]+/.exec(text.slice(i));
    if (digit && !isBengali(text[i - 1])) {
      raw.push({ value: Number(digit[0]), start: i, end: i + digit[0].length });
      i += digit[0].length;
      continue;
    }
    let hit: Phrase | null = null;
    for (const phrase of dict) {
      if (!text.startsWith(phrase.text, i)) continue;
      if (isBengali(text[i - 1])) continue;
      if (isBengali(text[i + phrase.text.length])) continue;
      hit = phrase;
      break;
    }
    if (hit) {
      raw.push({ value: hit.value, start: i, end: i + hit.text.length });
      i += hit.text.length;
      continue;
    }
    i += 1;
  }
  const merged: AmountHit[] = [];
  for (const token of raw) {
    const prev = merged[merged.length - 1];
    if (prev && token.value > 0 && token.value < prev.value && prev.value >= 100) {
      const gap = text.slice(prev.end, token.start);
      if (/^\s*$/.test(gap)) {
        prev.value += token.value;
        prev.end = token.end;
        continue;
      }
    }
    merged.push({ ...token });
  }
  return merged;
}
