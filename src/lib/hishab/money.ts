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

/*
 * ড়, ঢ় and য় each have two encodings: one precomposed code point, or the base
 * letter plus the nukta sign U+09BC. Unicode NFC always produces the second
 * (the precomposed letters are composition exclusions), so text from a speech
 * engine or a normalising keyboard arrives decomposed while every word this
 * app matches against is written precomposed. Fold to the precomposed form.
 */
function foldNukta(input: string): string {
  return input
    .replace(/\u09A1\u09BC/g, "\u09DC") // ড + nukta -> ড়
    .replace(/\u09A2\u09BC/g, "\u09DD") // ঢ + nukta -> ঢ়
    .replace(/\u09AF\u09BC/g, "\u09DF"); // য + nukta -> য়
}

export function normalizeText(input: string): string {
  return foldNukta(input)
    .replace(/[০-৯]/g, (ch) => String(ch.charCodeAt(0) - 0x09e6))
    .replace(/[।,.!?;:،"'“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * `unit` is the place value the phrase counts in: 1 for "তিন", 100 for
 * "তিনশ", 1000 for "তিন হাজার". "সাড়ে" adds half of it. A bare "হাজার" has
 * no count, so it has no unit and "সাড়ে হাজার" is not read as a number.
 */
type Phrase = { text: string; value: number; unit?: number };

let phraseCache: Phrase[] | null = null;

function phrases(): Phrase[] {
  if (phraseCache) return phraseCache;
  const list: Phrase[] = [];
  for (let n = 1; n <= 99; n += 1) {
    const w = N99[n]!;
    list.push({ text: `${w} লাখ`, value: n * 100_000, unit: 100_000 });
    list.push({ text: `${w} হাজার`, value: n * 1000, unit: 1000 });
    list.push({ text: w, value: n, unit: 1 });
  }
  for (let h = 1; h <= 9; h += 1) {
    const stem = h === 1 ? "একশ" : `${N99[h]}শ`;
    list.push({ text: `${stem}ো`, value: h * 100, unit: 100 });
    list.push({ text: stem, value: h * 100, unit: 100 });
  }
  list.push(
    { text: "লাখ", value: 100_000 },
    { text: "হাজার", value: 1000 },
    { text: "শত", value: 100 },
  );
  list.sort((a, b) => b.text.length - a.text.length || b.value - a.value);
  phraseCache = list;
  return list;
}

/* Spoken multipliers that follow a count after a space: "৩ হাজার", "দেড় লাখ". */
const SPACED_UNITS: [string, number][] = [
  ["লাখ", 100_000],
  ["হাজার", 1000],
];
/* The hundred suffix joins its count: "দেড়শ", "আড়াইশো". Longest first. */
const HUNDRED_SUFFIXES = ["শো", "শ"];
/* One and a half, two and a half: they multiply the unit that follows. */
const HALF_WORDS: [string, number][] = [
  ["\u09A6\u09C7\u09DC", 1.5], // দেড়
  ["\u0986\u09DC\u09BE\u0987", 2.5], // আড়াই
];
/* "সাড়ে" adds a half to the count after it: সাড়ে তিন হাজার is 3,500. */
const SARE = "\u09B8\u09BE\u09DC\u09C7"; // সাড়ে

type Match = { value: number; unit?: number; end: number };

function wordEndsAt(text: string, end: number): boolean {
  return !isBengali(text[end]);
}

function spacedUnitAt(text: string, from: number): { unit: number; end: number } | null {
  const space = /^\s*/.exec(text.slice(from))![0].length;
  for (const [word, unit] of SPACED_UNITS) {
    const end = from + space + word.length;
    if (text.startsWith(word, from + space) && wordEndsAt(text, end)) return { unit, end };
  }
  return null;
}

/* A plain count at `i`: digits (optionally times হাজার/লাখ) or a number phrase. */
function countAt(text: string, i: number): Match | null {
  if (isBengali(text[i - 1])) return null;
  const digit = /^[0-9]+/.exec(text.slice(i));
  if (digit) {
    const end = i + digit[0].length;
    const n = Number(digit[0]);
    for (const suffix of HUNDRED_SUFFIXES) {
      const after = end + suffix.length;
      if (text.startsWith(suffix, end) && wordEndsAt(text, after)) {
        return { value: n * 100, unit: 100, end: after };
      }
    }
    const unit = spacedUnitAt(text, end);
    if (unit) return { value: n * unit.unit, unit: unit.unit, end: unit.end };
    return { value: n, unit: 1, end };
  }
  for (const phrase of phrases()) {
    if (!text.startsWith(phrase.text, i)) continue;
    if (!wordEndsAt(text, i + phrase.text.length)) continue;
    return { value: phrase.value, unit: phrase.unit, end: i + phrase.text.length };
  }
  return null;
}

/* "দেড়", "দেড়শ", "দেড় হাজার", and the same for আড়াই. */
function halfWordAt(text: string, i: number): Match | null {
  if (isBengali(text[i - 1])) return null;
  for (const [word, factor] of HALF_WORDS) {
    if (!text.startsWith(word, i)) continue;
    const after = i + word.length;
    for (const suffix of HUNDRED_SUFFIXES) {
      const end = after + suffix.length;
      if (text.startsWith(suffix, after) && wordEndsAt(text, end)) {
        return { value: factor * 100, end };
      }
    }
    if (!wordEndsAt(text, after)) continue;
    const unit = spacedUnitAt(text, after);
    if (unit) return { value: factor * unit.unit, end: unit.end };
    return { value: factor, end: after };
  }
  return null;
}

/* "সাড়ে" + a count: half of the count's unit on top of it. */
function sareAt(text: string, i: number): Match | null {
  if (isBengali(text[i - 1]) || !text.startsWith(SARE, i)) return null;
  const after = i + SARE.length;
  const space = /^\s+/.exec(text.slice(after));
  if (!space) return null;
  const count = countAt(text, after + space[0].length);
  if (!count?.unit) return null;
  return { value: count.value + count.unit / 2, end: count.end };
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

/*
 * Find the amounts in `text`, which must already be through normalizeText
 * (ASCII digits, precomposed ড়/য়). A value can be fractional — "সাড়ে তিন"
 * is 3.5 — and callers decide whether a fraction is acceptable where they
 * use it; this function never rounds.
 */
export function scanAmounts(text: string): AmountHit[] {
  const raw: AmountHit[] = [];
  let i = 0;
  while (i < text.length) {
    const hit = sareAt(text, i) ?? halfWordAt(text, i) ?? countAt(text, i);
    if (hit) {
      raw.push({ value: hit.value, start: i, end: hit.end });
      i = hit.end;
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
