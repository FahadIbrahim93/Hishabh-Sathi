import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as Check, a as Store, c as Receipt, d as Mic, f as Menu, g as ChevronLeft, h as ChevronRight, l as Package, m as CircleCheck, n as Volume2, o as ShoppingBag, p as House, r as Undo2, s as RotateCcw, t as Wallet, u as PackagePlus, v as BookOpen, y as Banknote } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DdwV8p0_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BN = "০১২৩৪৫৬৭৮৯";
var N99 = [
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
	"নিরানব্বই"
];
function takaWords(amount) {
	const n = Math.round(amount);
	if (n === 0) return "শূন্য";
	if (n < 0) return `বিয়োগ ${takaWords(-n)}`;
	const parts = [];
	const crore = Math.floor(n / 1e7);
	const lakh = Math.floor(n % 1e7 / 1e5);
	const thou = Math.floor(n % 1e5 / 1e3);
	const rest = n % 1e3;
	if (crore) parts.push(`${chunk(crore)} কোটি`);
	if (lakh) parts.push(`${chunk(lakh)} লাখ`);
	if (thou) parts.push(`${chunk(thou)} হাজার`);
	if (rest) parts.push(chunk(rest));
	return parts.join(" ");
}
function chunk(n) {
	if (n < 100) return N99[n] ?? String(n);
	const h = Math.floor(n / 100);
	const r = n % 100;
	const head = h === 1 ? "একশ" : `${N99[h]}শ`;
	return r ? `${head} ${N99[r]}` : head;
}
function toBnDigits(value) {
	return value.replace(/\d/g, (d) => BN[Number(d)] ?? d);
}
function toBn(n) {
	return toBnDigits(String(Math.trunc(Math.abs(n))));
}
function toBnGrouped(n) {
	return (n < 0 ? "−" : "") + toBnDigits(Math.abs(Math.trunc(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}
function formatTaka(paisa) {
	const neg = paisa < 0;
	const abs = Math.abs(Math.round(paisa));
	const taka = Math.floor(abs / 100);
	const poisha = abs % 100;
	const body = poisha === 0 ? toBnGrouped(taka) : `${toBnGrouped(taka)}.${toBn(poisha).padStart(2, "০")}`;
	return `${neg ? "−" : ""}৳ ${body}`;
}
function formatQty(qty, packSize = 1, packName = "কেস") {
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
function takaToPaisa(taka) {
	return Math.round(taka) * 100;
}
function startOfLocalDay(ts) {
	const d = new Date(ts);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}
var MONTHS = [
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
	"ডিসে"
];
function formatWhen(ts, now = Date.now()) {
	const start = startOfLocalDay(now);
	const d = new Date(ts);
	const clock = toBnDigits(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
	if (ts >= start) return `আজ ${clock}`;
	if (ts >= start - 864e5) return `গতকাল ${clock}`;
	return `${toBn(d.getDate())} ${MONTHS[d.getMonth()]}`;
}
function normalizeText(input) {
	return input.replace(/[০-৯]/g, (ch) => String(ch.charCodeAt(0) - 2534)).replace(/[।,.!?;:،"'“”]/g, " ").replace(/\s+/g, " ").trim();
}
var phraseCache = null;
function phrases() {
	if (phraseCache) return phraseCache;
	const list = [];
	for (let n = 1; n <= 99; n += 1) {
		const w = N99[n];
		list.push({
			text: `${w} লাখ`,
			value: n * 1e5
		});
		list.push({
			text: `${w} হাজার`,
			value: n * 1e3
		});
		list.push({
			text: w,
			value: n
		});
	}
	for (let h = 1; h <= 9; h += 1) {
		const stem = h === 1 ? "একশ" : `${N99[h]}শ`;
		list.push({
			text: `${stem}ো`,
			value: h * 100
		});
		list.push({
			text: stem,
			value: h * 100
		});
	}
	list.push({
		text: "লাখ",
		value: 1e5
	}, {
		text: "হাজার",
		value: 1e3
	}, {
		text: "শত",
		value: 100
	});
	list.sort((a, b) => b.text.length - a.text.length || b.value - a.value);
	phraseCache = list;
	return list;
}
function isBengali(ch) {
	if (!ch) return false;
	const c = ch.codePointAt(0) ?? 0;
	return c >= 2432 && c <= 2559;
}
function scanAmounts(text) {
	const raw = [];
	const dict = phrases();
	let i = 0;
	while (i < text.length) {
		const digit = /^[0-9]+/.exec(text.slice(i));
		if (digit && !isBengali(text[i - 1])) {
			raw.push({
				value: Number(digit[0]),
				start: i,
				end: i + digit[0].length
			});
			i += digit[0].length;
			continue;
		}
		let hit = null;
		for (const phrase of dict) {
			if (!text.startsWith(phrase.text, i)) continue;
			if (isBengali(text[i - 1])) continue;
			if (isBengali(text[i + phrase.text.length])) continue;
			hit = phrase;
			break;
		}
		if (hit) {
			raw.push({
				value: hit.value,
				start: i,
				end: i + hit.text.length
			});
			i += hit.text.length;
			continue;
		}
		i += 1;
	}
	const merged = [];
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
function ScreenHeader({ title, onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-20 flex items-center gap-1 bg-paper px-2 py-2",
		children: [onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onBack,
			"aria-label": "পিছনে",
			className: "grid size-12 shrink-0 place-items-center rounded-full text-ink",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-6" })
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-xl font-semibold text-ink",
			children: title
		})]
	});
}
function Primary({ children, onClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled,
		onClick,
		className: "flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-palm px-4 font-display text-lg font-semibold text-paper disabled:opacity-40",
		children
	});
}
function Secondary({ children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "flex min-h-12 w-full items-center justify-center rounded-2xl bg-card px-4 font-display text-base font-semibold text-ink ring-1 ring-line",
		children
	});
}
function Choice({ title, detail, onClick, selected }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: `flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ring-1 ${selected ? "bg-palm-soft ring-palm" : "bg-card ring-line"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block font-display text-lg font-semibold text-ink",
				children: title
			}), detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 block text-sm text-ink-soft",
				children: detail
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
			className: "size-5 shrink-0 text-ink-soft",
			"aria-hidden": "true"
		})]
	});
}
function Callout({ title, body, tone = "info" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-2xl px-4 py-3 ring-1 ${tone === "warn" ? "bg-clay-soft text-ink ring-clay" : "bg-saffron-soft text-ink ring-saffron"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-base font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm leading-relaxed text-ink-soft",
			children: body
		})]
	});
}
function Field({ label, value, active, onClick }) {
	const className = `flex min-h-16 w-full items-center justify-between rounded-2xl px-4 text-left ring-1 ${active ? "bg-palm-soft ring-palm" : "bg-card ring-line"}`;
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-sm text-ink-soft",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-display text-2xl font-semibold text-ink tabular-nums",
		children: toBnGrouped(value)
	})] });
	if (!onClick) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		children: inner
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className,
		children: inner
	});
}
var PAD = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"clear",
	"0",
	"back"
];
function NumPad({ onDigit, onClear, onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-2",
		"aria-label": "সংখ্যার প্যাড",
		children: PAD.map((key) => {
			const label = key === "clear" ? "মুছুন" : key === "back" ? "মুছুন এক ঘর" : toBn(Number(key));
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": label,
				onClick: () => {
					if (key === "clear") onClear();
					else if (key === "back") onBack();
					else onDigit(Number(key));
				},
				className: "flex min-h-12 items-center justify-center rounded-2xl bg-card font-display text-xl font-semibold text-ink ring-1 ring-line",
				children: key === "back" ? "⌫" : key === "clear" ? "সব" : toBn(Number(key))
			}, key);
		})
	});
}
function pushDigit(current, digit) {
	const next = Number(`${current || ""}${digit}`.replace(/^0+(\d)/, "$1"));
	if (!Number.isFinite(next) || next > 1e7) return current;
	return next;
}
function popDigit(current) {
	const next = String(current).slice(0, -1);
	return next ? Number(next) : 0;
}
function TextField({ label, value, onChange, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1 block text-sm text-ink-soft",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value,
			placeholder,
			onChange: (event) => onChange(event.target.value),
			className: "h-12 w-full rounded-xl bg-card px-4 text-base text-ink ring-1 ring-line outline-none placeholder:text-ink-soft"
		})]
	});
}
function Page({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-3 px-4 pb-8",
		children
	});
}
var WAREHOUSE = "warehouse";
function partyLoc(partyId) {
	return `party:${partyId}`;
}
var BooksError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "BooksError";
	}
};
var CREDIT_NORMAL = /* @__PURE__ */ new Set([
	"revenue",
	"payable",
	"capital"
]);
function balance(books, account, partyId) {
	let debit = 0;
	let credit = 0;
	for (const entry of books.entries) for (const line of entry.lines) {
		if (line.account !== account) continue;
		if (partyId && line.partyId !== partyId) continue;
		debit += line.debit;
		credit += line.credit;
	}
	return CREDIT_NORMAL.has(account) ? credit - debit : debit - credit;
}
function stockAt(books, productId, location) {
	let qty = 0;
	for (const entry of books.entries) for (const move of entry.stock) if (move.productId === productId && move.location === location) qty += move.qtyDelta;
	return qty;
}
function stockTotal(books, productId) {
	let qty = 0;
	for (const entry of books.entries) for (const move of entry.stock) if (move.productId === productId) qty += move.qtyDelta;
	return qty;
}
function partyById(books, id) {
	return books.parties.find((party) => party.id === id);
}
function productById(books, id) {
	return books.products.find((product) => product.id === id);
}
function explain(books, entry) {
	const party = partyById(books, entry.partyId);
	const product = productById(books, entry.productId);
	const who = party?.name;
	const qty = product && entry.meta.qty != null ? formatQty(entry.meta.qty, entry.meta.packSize ?? product.packSize, product.packName) : void 0;
	const rows = [];
	const add = (k, v) => {
		if (v) rows.push({
			k,
			v
		});
	};
	switch (entry.kind) {
		case "opening": return {
			title: "শুরুর হিসাব",
			rows: [{
				k: "নগদ",
				v: formatTaka(cashOf(entry))
			}, {
				k: "মাল",
				v: "গুদামে ঢোকানো হয়েছে"
			}],
			foot: "বিক্রি নয়। আগের মাল আর টাকা বসানো।"
		};
		case "sale":
			add("দোকান", who);
			add("মাল", product?.name);
			add("পরিমাণ", qty);
			add("মোট বিক্রি", formatTaka(entry.meta.total ?? 0));
			add("টাকা পেয়েছি", formatTaka(entry.meta.received ?? 0));
			add("নতুন বাকি", formatTaka((entry.meta.total ?? 0) - (entry.meta.received ?? 0)));
			return {
				title: entry.meta.fromConsignment ? "রাখা মাল বিক্রি" : "বিক্রি",
				rows,
				foot: entry.meta.fromConsignment ? "দোকানে রাখা মাল থেকে বিক্রি হয়েছে। এখন বিক্রি ধরা হলো।" : void 0
			};
		case "collection":
			add("দোকান", who);
			add("টাকা পেয়েছি", formatTaka(entry.meta.received ?? 0));
			add("পাওনা কমেছে", formatTaka(entry.meta.received ?? 0));
			return {
				title: "পুরনো বাকি আদায়",
				rows,
				foot: "নতুন বিক্রি নয়। শুধু আগের পাওনা কমেছে।"
			};
		case "consign":
			add("দোকান", who);
			add("মাল", product?.name);
			add("পরিমাণ", qty);
			return {
				title: "দোকানে মাল রাখা",
				rows,
				foot: "এটা বিক্রি নয়। মাল এখনও আপনার। পাওনা বাড়েনি।"
			};
		case "return":
			add("দোকান", who);
			add("মাল", product?.name);
			add("পরিমাণ", qty);
			if (entry.meta.returnMode === "consign") return {
				title: "রাখা মাল ফেরত",
				rows,
				foot: "বিক্রি কমেনি। মাল আবার গুদামে।"
			};
			add("বিক্রি কমেছে", formatTaka(entry.meta.total ?? 0));
			if ((entry.meta.refund ?? 0) > 0) add("টাকা ফেরত", formatTaka(entry.meta.refund ?? 0));
			return {
				title: "বিক্রি ফেরত",
				rows,
				foot: entry.meta.label
			};
		case "purchase":
			add("কার কাছ থেকে", who ?? "নগদ কেনা");
			add("মাল", product?.name);
			add("পরিমাণ", qty);
			add("মোট কেনা", formatTaka(entry.meta.total ?? 0));
			add("দিয়েছি", formatTaka(entry.meta.received ?? 0));
			add("বাকি দেনা", formatTaka((entry.meta.total ?? 0) - (entry.meta.received ?? 0)));
			return {
				title: "মাল এনেছি",
				rows
			};
		case "expense":
			add("খাতা", entry.meta.label);
			add("খরচ", formatTaka(entry.meta.total ?? 0));
			return {
				title: "খরচ",
				rows
			};
		default: return {
			title: "হিসাব",
			rows: []
		};
	}
}
function cashOf(entry) {
	return entry.lines.filter((line) => line.account === "cash").reduce((sum, line) => sum + line.debit - line.credit, 0);
}
function finish(entry) {
	let debit = 0;
	let credit = 0;
	for (const line of entry.lines) {
		if (!Number.isInteger(line.debit) || !Number.isInteger(line.credit)) throw new BooksError("হিসাবের অঙ্ক পূর্ণসংখ্যা নয়। সেভ হয়নি।");
		if (line.debit < 0 || line.credit < 0 || line.debit > 0 && line.credit > 0) throw new BooksError("হিসাবের লাইন ঠিক নেই। সেভ হয়নি।");
		debit += line.debit;
		credit += line.credit;
	}
	if (debit !== credit) throw new BooksError("হিসাবের দুই দিক মেলেনি। সেভ হয়নি।");
	for (const move of entry.stock) if (!Number.isInteger(move.qtyDelta) || move.qtyDelta === 0) throw new BooksError("মালের সংখ্যা ঠিক নেই। সেভ হয়নি।");
	return entry;
}
function mustParty(books, partyId) {
	const party = partyById(books, partyId);
	if (!party) throw new BooksError("দোকান বেছে নিন।");
	return party;
}
function mustProduct(books, productId) {
	const product = productById(books, productId);
	if (!product) throw new BooksError("মাল বেছে নিন।");
	return product;
}
function line(account, debit, credit, partyId) {
	const row = {
		account,
		debit,
		credit
	};
	if (partyId) row.partyId = partyId;
	return row;
}
function apply(books, entry) {
	if (books.entries.some((existing) => existing.id === entry.id)) return books;
	finish(entry);
	for (const move of entry.stock) if (move.qtyDelta < 0) {
		if (stockAt(books, move.productId, move.location) + move.qtyDelta < 0) throw new BooksError("মাল আর নেই। হিসাব সেভ হয়নি।");
	}
	if (entry.kind === "collection" && entry.partyId) {
		const due = balance(books, "receivable", entry.partyId);
		if ((entry.meta.received ?? 0) > due) throw new BooksError("পাওনা এর মধ্যে কমে গেছে। আবার দেখুন।");
	}
	let products = books.products;
	if (entry.costUpdate) products = products.map((product) => product.id === entry.costUpdate?.productId ? {
		...product,
		costPaisa: entry.costUpdate.costPaisa
	} : product);
	if (entry.priceUpdate) products = products.map((product) => product.id === entry.priceUpdate?.productId ? {
		...product,
		pricePaisa: entry.priceUpdate.pricePaisa
	} : product);
	return {
		...books,
		products,
		entries: [...books.entries, entry]
	};
}
function audit(books) {
	let debit = 0;
	let credit = 0;
	for (const entry of books.entries) {
		finish(entry);
		for (const row of entry.lines) {
			debit += row.debit;
			credit += row.credit;
		}
	}
	const locations = /* @__PURE__ */ new Set();
	for (const entry of books.entries) for (const move of entry.stock) locations.add(`${move.productId}:${move.location}`);
	for (const key of locations) {
		const split = key.indexOf(":");
		if (stockAt(books, key.slice(0, split), key.slice(split + 1)) < 0) return {
			ok: false,
			debit,
			credit
		};
	}
	return {
		ok: debit === credit,
		debit,
		credit
	};
}
function buildOpening(input) {
	let inventory = 0;
	const stock = [];
	for (const row of input.stock) {
		if (!Number.isInteger(row.qty) || row.qty < 0) throw new BooksError("শুরুর মালের সংখ্যা ঠিক নয়।");
		inventory += row.qty * row.costPaisa;
		if (row.qty > 0) stock.push({
			productId: row.productId,
			location: WAREHOUSE,
			qtyDelta: row.qty
		});
	}
	const names = input.stock.filter((row) => row.qty > 0).map((row) => input.products.find((product) => product.id === row.productId)?.name ?? "মাল").join(", ");
	return finish({
		id: input.id,
		kind: "opening",
		at: input.at,
		summary: `শুরুর হিসাব · ${names}`,
		lines: [
			line("inventory", inventory, 0),
			line("cash", input.cashPaisa, 0),
			line("capital", 0, inventory + input.cashPaisa)
		],
		stock,
		meta: { total: input.cashPaisa }
	});
}
function buildSale(books, input) {
	if (!Number.isInteger(input.receivedPaisa) || input.receivedPaisa < 0) throw new BooksError("পাওয়া টাকা ঠিক নয়।");
	if (input.productId) {
		const product = mustProduct(books, input.productId);
		const qty = input.qty ?? 0;
		const price = input.unitPricePaisa ?? product.pricePaisa;
		if (!Number.isInteger(qty) || qty <= 0) throw new BooksError("কয়টা মাল, সেটা বলুন।");
		if (!Number.isInteger(price) || price <= 0) throw new BooksError("প্রতি পিসের দাম বলুন।");
		const total = qty * price;
		if (input.receivedPaisa > total) throw new BooksError("মোট বিক্রির চেয়ে বেশি টাকা পেয়েছেন। ঠিক করুন।");
		const due = total - input.receivedPaisa;
		const party = due > 0 ? mustParty(books, input.partyId) : partyById(books, input.partyId);
		const location = input.fromConsignment ? partyLoc(mustParty(books, input.partyId).id) : WAREHOUSE;
		const have = stockAt(books, product.id, location);
		if (have < qty) throw new BooksError(`${input.fromConsignment ? "দোকানে রাখা আছে" : "গুদামে আছে"} ${formatQty(have, product.packSize, product.packName)}। ${formatQty(qty, product.packSize, product.packName)} বিক্রি হবে না।`);
		const cost = qty * product.costPaisa;
		const lines = [];
		if (input.receivedPaisa > 0) lines.push(line("cash", input.receivedPaisa, 0));
		if (due > 0 && party) lines.push(line("receivable", due, 0, party.id));
		lines.push(line("revenue", 0, total));
		if (cost > 0) {
			lines.push(line("cogs", cost, 0));
			lines.push(line("inventory", 0, cost));
		}
		const who = party ? `${party.name} · ` : "নগদ · ";
		return finish({
			id: input.id,
			kind: "sale",
			at: input.at,
			partyId: party?.id,
			productId: product.id,
			summary: `${who}${product.name} · ${formatQty(qty, product.packSize, product.packName)} · ${formatTaka(total)}`,
			lines,
			stock: [{
				productId: product.id,
				location,
				qtyDelta: -qty
			}],
			meta: {
				qty,
				unitPrice: price,
				total,
				received: input.receivedPaisa,
				fromConsignment: Boolean(input.fromConsignment),
				packSize: product.packSize
			},
			priceUpdate: price !== product.pricePaisa ? {
				productId: product.id,
				pricePaisa: price
			} : void 0
		});
	}
	const total = input.totalPaisa ?? 0;
	if (!Number.isInteger(total) || total <= 0) throw new BooksError("বিক্রির টাকা বলুন।");
	if (input.receivedPaisa > total) throw new BooksError("মোট বিক্রির চেয়ে বেশি টাকা পেয়েছেন। ঠিক করুন।");
	const due = total - input.receivedPaisa;
	const party = due > 0 ? mustParty(books, input.partyId) : partyById(books, input.partyId);
	const lines = [];
	if (input.receivedPaisa > 0) lines.push(line("cash", input.receivedPaisa, 0));
	if (due > 0 && party) lines.push(line("receivable", due, 0, party.id));
	lines.push(line("revenue", 0, total));
	return finish({
		id: input.id,
		kind: "sale",
		at: input.at,
		partyId: party?.id,
		summary: `${party ? `${party.name} · ` : "নগদ · "}বিক্রি ${formatTaka(total)}`,
		lines,
		stock: [],
		meta: {
			total,
			received: input.receivedPaisa
		}
	});
}
function buildCollection(books, input) {
	const party = mustParty(books, input.partyId);
	if (!Number.isInteger(input.amountPaisa) || input.amountPaisa <= 0) throw new BooksError("কত টাকা পেয়েছেন, সেটা বলুন।");
	const due = balance(books, "receivable", party.id);
	if (due <= 0) throw new BooksError(`${party.name}-এর পাওনা নেই।`);
	if (input.amountPaisa > due) throw new BooksError(`পাওনা ${formatTaka(due)}। তার বেশি আদায় হবে না।`);
	return finish({
		id: input.id,
		kind: "collection",
		at: input.at,
		partyId: party.id,
		summary: `${party.name} · আদায় ${formatTaka(input.amountPaisa)}`,
		lines: [line("cash", input.amountPaisa, 0), line("receivable", 0, input.amountPaisa, party.id)],
		stock: [],
		meta: {
			received: input.amountPaisa,
			total: input.amountPaisa
		}
	});
}
function buildConsign(books, input) {
	const party = mustParty(books, input.partyId);
	const product = mustProduct(books, input.productId);
	if (!Number.isInteger(input.qty) || input.qty <= 0) throw new BooksError("কয়টা মাল রাখবেন, সেটা বলুন।");
	const have = stockAt(books, product.id, WAREHOUSE);
	if (have < input.qty) throw new BooksError(`গুদামে আছে ${formatQty(have, product.packSize, product.packName)}। অত মাল রাখা যাবে না।`);
	return finish({
		id: input.id,
		kind: "consign",
		at: input.at,
		partyId: party.id,
		productId: product.id,
		summary: `${party.name} · রাখা মাল ${product.name} · ${formatQty(input.qty, product.packSize, product.packName)}`,
		lines: [],
		stock: [{
			productId: product.id,
			location: WAREHOUSE,
			qtyDelta: -input.qty
		}, {
			productId: product.id,
			location: partyLoc(party.id),
			qtyDelta: input.qty
		}],
		meta: {
			qty: input.qty,
			packSize: product.packSize,
			total: 0,
			received: 0
		}
	});
}
function netSold(books, partyId, productId) {
	let qty = 0;
	for (const entry of books.entries) {
		if (entry.partyId !== partyId || entry.productId !== productId) continue;
		if (entry.kind === "sale") qty += entry.meta.qty ?? 0;
		if (entry.kind === "return" && entry.meta.returnMode === "sold") qty -= entry.meta.qty ?? 0;
	}
	return qty;
}
function buildReturn(books, input) {
	const party = mustParty(books, input.partyId);
	const product = mustProduct(books, input.productId);
	if (!Number.isInteger(input.qty) || input.qty <= 0) throw new BooksError("কয়টা ফেরত, সেটা বলুন।");
	if (input.mode === "consign") {
		const have = stockAt(books, product.id, partyLoc(party.id));
		if (have < input.qty) throw new BooksError(`দোকানে রাখা আছে ${formatQty(have, product.packSize, product.packName)}। অত ফেরত আসবে না।`);
		return finish({
			id: input.id,
			kind: "return",
			at: input.at,
			partyId: party.id,
			productId: product.id,
			summary: `${party.name} · রাখা মাল ফেরত · ${product.name}`,
			lines: [],
			stock: [{
				productId: product.id,
				location: partyLoc(party.id),
				qtyDelta: -input.qty
			}, {
				productId: product.id,
				location: WAREHOUSE,
				qtyDelta: input.qty
			}],
			meta: {
				qty: input.qty,
				packSize: product.packSize,
				returnMode: "consign",
				total: 0,
				label: input.reason
			}
		});
	}
	const sold = netSold(books, party.id, product.id);
	if (input.qty > sold) throw new BooksError(`${party.name}-এ ${formatQty(Math.max(sold, 0), product.packSize, product.packName)} বিক্রি হয়েছে। তার বেশি ফেরত নয়।`);
	if (!Number.isInteger(input.unitPricePaisa) || input.unitPricePaisa <= 0) throw new BooksError("ফেরতের দাম বলুন।");
	const value = input.qty * input.unitPricePaisa;
	const cost = input.qty * product.costPaisa;
	const due = balance(books, "receivable", party.id);
	const creditReceivable = Math.min(due, value);
	const refund = value - creditReceivable;
	const lines = [line("revenue", value, 0)];
	if (creditReceivable > 0) lines.push(line("receivable", 0, creditReceivable, party.id));
	if (refund > 0) lines.push(line("cash", 0, refund));
	if (cost > 0) {
		lines.push(line("inventory", cost, 0));
		lines.push(line("cogs", 0, cost));
	}
	return finish({
		id: input.id,
		kind: "return",
		at: input.at,
		partyId: party.id,
		productId: product.id,
		summary: `${party.name} · ফেরত ${product.name} · ${formatQty(input.qty, product.packSize, product.packName)}`,
		lines,
		stock: [{
			productId: product.id,
			location: WAREHOUSE,
			qtyDelta: input.qty
		}],
		meta: {
			qty: input.qty,
			unitPrice: input.unitPricePaisa,
			total: value,
			refund,
			packSize: product.packSize,
			returnMode: "sold",
			label: input.reason
		}
	});
}
function buildPurchase(books, input) {
	const product = mustProduct(books, input.productId);
	if (!Number.isInteger(input.qty) || input.qty <= 0) throw new BooksError("কয়টা মাল এনেছেন, সেটা বলুন।");
	if (!Number.isInteger(input.costPaisa) || input.costPaisa <= 0) throw new BooksError("কেনা দাম বলুন।");
	if (!Number.isInteger(input.paidPaisa) || input.paidPaisa < 0) throw new BooksError("কত দিয়েছেন, সেটা বলুন।");
	const total = input.qty * input.costPaisa;
	if (input.paidPaisa > total) throw new BooksError("মোট কেনার চেয়ে বেশি দেওয়া হয়েছে।");
	const payable = total - input.paidPaisa;
	const party = payable > 0 ? mustParty(books, input.partyId) : partyById(books, input.partyId);
	const lines = [line("inventory", total, 0)];
	if (input.paidPaisa > 0) lines.push(line("cash", 0, input.paidPaisa));
	if (payable > 0 && party) lines.push(line("payable", 0, payable, party.id));
	const owned = stockTotal(books, product.id);
	const avg = Math.round((owned * product.costPaisa + input.qty * input.costPaisa) / (owned + input.qty));
	return finish({
		id: input.id,
		kind: "purchase",
		at: input.at,
		partyId: party?.id,
		productId: product.id,
		summary: `${product.name} কেনা · ${formatQty(input.qty, product.packSize, product.packName)} · ${formatTaka(total)}`,
		lines,
		stock: [{
			productId: product.id,
			location: WAREHOUSE,
			qtyDelta: input.qty
		}],
		meta: {
			qty: input.qty,
			unitPrice: input.costPaisa,
			total,
			received: input.paidPaisa,
			packSize: product.packSize
		},
		costUpdate: {
			productId: product.id,
			costPaisa: avg
		}
	});
}
function buildExpense(books, input) {
	if (!Number.isInteger(input.amountPaisa) || input.amountPaisa <= 0) throw new BooksError("খরচের টাকা বলুন।");
	const label = input.label.trim() || "অন্যান্য";
	return finish({
		id: input.id,
		kind: "expense",
		at: input.at,
		summary: `${label} · ${formatTaka(input.amountPaisa)}`,
		lines: [line("expense", input.amountPaisa, 0), line("cash", 0, input.amountPaisa)],
		stock: [],
		meta: {
			total: input.amountPaisa,
			label
		}
	});
}
function buildStockAdd(books, input) {
	const product = mustProduct(books, input.productId);
	if (!Number.isInteger(input.qty) || input.qty <= 0) throw new BooksError("কয়টা মাল, সেটা বলুন।");
	const value = input.qty * input.costPaisa;
	return finish({
		id: input.id,
		kind: "opening",
		at: input.at,
		productId: product.id,
		summary: `নতুন মাল · ${product.name} · ${formatQty(input.qty, product.packSize, product.packName)}`,
		lines: [line("inventory", value, 0), line("capital", 0, value)],
		stock: [{
			productId: product.id,
			location: WAREHOUSE,
			qtyDelta: input.qty
		}],
		meta: {
			qty: input.qty,
			total: value,
			packSize: product.packSize
		}
	});
}
function revenueBetween(books, start, end) {
	let credit = 0;
	let debit = 0;
	for (const entry of books.entries) {
		if (entry.at < start || entry.at >= end) continue;
		for (const row of entry.lines) {
			if (row.account !== "revenue") continue;
			credit += row.credit;
			debit += row.debit;
		}
	}
	return credit - debit;
}
function collectedBetween(books, start, end) {
	let total = 0;
	for (const entry of books.entries) {
		if (entry.at < start || entry.at >= end) continue;
		if (entry.kind === "sale" || entry.kind === "collection") total += entry.meta.received ?? 0;
		if (entry.kind === "return") total -= entry.meta.refund ?? 0;
	}
	return total;
}
function productsAt(books, location) {
	return books.products.map((product) => ({
		product,
		qty: stockAt(books, product.id, location)
	})).filter((row) => row.qty > 0);
}
function blankDraft(kind, extra = {}) {
	return {
		kind,
		step: "party",
		unit: "pack",
		qtyInput: 0,
		unitPriceTaka: 0,
		receivedTaka: 0,
		receivedKnown: false,
		amountTaka: 0,
		paidTaka: 0,
		paidKnown: false,
		costTaka: 0,
		expenseLabel: "",
		returnMode: "sold",
		reasonKnown: false,
		fromConsignment: false,
		partySkipped: false,
		notes: [],
		...extra
	};
}
function stepsFor(draft, mode) {
	if (draft.kind === "expense") return ["money", "confirm"];
	if (draft.kind === "collection") return [
		"party",
		"money",
		"confirm"
	];
	if (draft.kind === "consign") return [
		"party",
		"product",
		"confirm"
	];
	if (draft.kind === "return") return [
		"party",
		"product",
		"reason",
		"confirm"
	];
	if (draft.kind === "purchase") return [
		"party",
		"product",
		"money",
		"confirm"
	];
	if (draft.productId || mode === "stock") return [
		"party",
		"product",
		"money",
		"confirm"
	];
	return [
		"party",
		"money",
		"confirm"
	];
}
function piecesOf(draft, packSize) {
	if (draft.qtyInput <= 0) return 0;
	return draft.unit === "pack" ? draft.qtyInput * Math.max(packSize, 1) : draft.qtyInput;
}
function firstGap(draft, books) {
	for (const step of stepsFor(draft, books.mode)) {
		if (step === "confirm") return "confirm";
		if (!stepDone(step, draft, books)) return step;
	}
	return "confirm";
}
function stepDone(step, draft, books) {
	if (step === "party") {
		if (draft.kind === "purchase") return Boolean(draft.partyId) || draft.partySkipped;
		if (draft.kind === "expense") return true;
		if (draft.kind === "sale" && !draft.productId && books.mode === "khata") {
			if ((draft.receivedKnown ? draft.amountTaka - draft.receivedTaka : draft.amountTaka) <= 0 && draft.receivedKnown && draft.amountTaka > 0) return true;
		}
		return Boolean(draft.partyId);
	}
	if (step === "product") return Boolean(draft.productId) && draft.qtyInput > 0;
	if (step === "reason") return draft.reasonKnown;
	if (step === "money") {
		if (draft.kind === "expense") return draft.amountTaka > 0 && Boolean(draft.expenseLabel);
		if (draft.kind === "collection") return draft.amountTaka > 0;
		if (draft.kind === "purchase") return draft.costTaka > 0 && draft.paidKnown;
		if (draft.productId || books.mode === "stock") return draft.unitPriceTaka > 0 && draft.receivedKnown;
		return draft.amountTaka > 0 && draft.receivedKnown;
	}
	return true;
}
function entryFromDraft(books, draft, id, at = Date.now()) {
	const product = productById(books, draft.productId);
	if (draft.kind === "sale" && (draft.productId || books.mode === "stock")) return buildSale(books, {
		id,
		at,
		partyId: draft.partyId,
		productId: draft.productId,
		qty: piecesOf(draft, product?.packSize ?? 1),
		unitPricePaisa: takaToPaisa(draft.unitPriceTaka),
		receivedPaisa: takaToPaisa(draft.receivedTaka),
		fromConsignment: draft.fromConsignment
	});
	if (draft.kind === "sale") return buildSale(books, {
		id,
		at,
		partyId: draft.partyId,
		totalPaisa: takaToPaisa(draft.amountTaka),
		receivedPaisa: takaToPaisa(draft.receivedTaka)
	});
	if (draft.kind === "collection") {
		if (!draft.partyId) throw new Error("দোকান বেছে নিন।");
		return buildCollection(books, {
			id,
			at,
			partyId: draft.partyId,
			amountPaisa: takaToPaisa(draft.amountTaka)
		});
	}
	if (draft.kind === "consign") {
		if (!draft.partyId || !draft.productId) throw new Error("দোকান আর মাল দুটোই লাগবে।");
		return buildConsign(books, {
			id,
			at,
			partyId: draft.partyId,
			productId: draft.productId,
			qty: piecesOf(draft, product?.packSize ?? 1)
		});
	}
	if (draft.kind === "return") {
		if (!draft.partyId || !draft.productId) throw new Error("দোকান আর মাল দুটোই লাগবে।");
		return buildReturn(books, {
			id,
			at,
			partyId: draft.partyId,
			productId: draft.productId,
			qty: piecesOf(draft, product?.packSize ?? 1),
			unitPricePaisa: takaToPaisa(draft.unitPriceTaka || Math.round((product?.pricePaisa ?? 0) / 100)),
			mode: draft.returnMode,
			reason: draft.expenseLabel || void 0
		});
	}
	if (draft.kind === "purchase") {
		if (!draft.productId) throw new Error("কোন মাল এনেছেন?");
		return buildPurchase(books, {
			id,
			at,
			partyId: draft.partySkipped ? void 0 : draft.partyId,
			productId: draft.productId,
			qty: piecesOf(draft, product?.packSize ?? 1),
			costPaisa: takaToPaisa(draft.costTaka),
			paidPaisa: takaToPaisa(draft.paidTaka)
		});
	}
	return buildExpense(books, {
		id,
		at,
		amountPaisa: takaToPaisa(draft.amountTaka),
		label: draft.expenseLabel
	});
}
function previewDraft(books, draft, at = Date.now()) {
	try {
		const entry = entryFromDraft(books, draft, "preview-temp", at);
		const next = apply(structuredClone(books), entry);
		const view = explain(books, entry);
		const after = [];
		if (entry.partyId && (entry.kind === "sale" || entry.kind === "collection" || entry.kind === "return")) after.push({
			k: "এই দোকানের পাওনা হবে",
			v: formatTaka(balance(next, "receivable", entry.partyId))
		});
		if (entry.productId && entry.kind !== "expense") {
			const product = productById(books, entry.productId);
			if (product) {
				after.push({
					k: "গুদামে থাকবে",
					v: formatQty(stockAt(next, product.id, WAREHOUSE), product.packSize, product.packName)
				});
				if (entry.partyId) {
					if (productsAt(next, partyLoc(entry.partyId)).filter((row) => row.product.id === product.id).length || entry.kind === "consign") after.push({
						k: "দোকানে রাখা মাল",
						v: formatQty(stockAt(next, product.id, partyLoc(entry.partyId)), product.packSize, product.packName)
					});
				}
			}
		}
		return {
			ok: true,
			title: view.title,
			rows: view.rows,
			foot: view.foot,
			readback: readback(draft, books),
			banner: bannerFor(entry.kind, Boolean(entry.meta.fromConsignment), entry.meta.returnMode),
			after
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "হিসাব মেলানো যায়নি।"
		};
	}
}
function bannerFor(kind, fromConsignment, returnMode) {
	if (kind === "consign" || returnMode === "consign") return {
		title: "এটা বিক্রি নয়",
		body: "মাল এখনও আপনার। দোকানের পাওনা বাড়বে না, বিক্রিও বাড়বে না।"
	};
	if (kind === "collection") return {
		title: "পুরনো বাকি",
		body: "আজকের বিক্রি বাড়বে না। শুধু আগের পাওনা কমবে।"
	};
	if (fromConsignment) return {
		title: "রাখা মাল এখন বিক্রি",
		body: "যে মাল দোকানে ছিল, সেটাই বিক্রি ধরা হবে।"
	};
}
function readback(draft, books) {
	const product = productById(books, draft.productId);
	if (draft.kind === "sale" && (draft.productId || books.mode === "stock")) {
		const total = piecesOf(draft, product?.packSize ?? 1) * draft.unitPriceTaka;
		const got = draft.receivedTaka;
		const due = Math.max(total - got, 0);
		return `${takaWords(total)} টাকার বিক্রি, ${takaWords(got)} টাকা পেয়েছেন, ${takaWords(due)} টাকা বাকি।`;
	}
	if (draft.kind === "sale") {
		const due = Math.max(draft.amountTaka - draft.receivedTaka, 0);
		return `${takaWords(draft.amountTaka)} টাকার বিক্রি, ${takaWords(draft.receivedTaka)} টাকা পেয়েছেন, ${takaWords(due)} টাকা বাকি।`;
	}
	if (draft.kind === "collection") return `${takaWords(draft.amountTaka)} টাকা আদায়। এটা নতুন বিক্রি নয়।`;
	if (draft.kind === "consign" && product) return `${formatQty(piecesOf(draft, product.packSize), product.packSize, product.packName)} দোকানে রাখা হচ্ছে। এটা বিক্রি নয়।`;
	if (draft.kind === "return" && draft.returnMode === "consign") return "রাখা মাল ফিরে আসছে। বিক্রি বা পাওনা বদলাবে না।";
	if (draft.kind === "return") return "বিক্রি ফেরত। মাল বাড়বে, হিসাব উল্টে যাবে।";
	if (draft.kind === "purchase") return `${takaWords(piecesOf(draft, product?.packSize ?? 1) * draft.costTaka)} টাকার মাল কেনা।`;
	return `${takaWords(draft.amountTaka)} টাকা ${draft.expenseLabel || "খরচ"}।`;
}
var DAY = 864e5;
var HOUR = 36e5;
function earlierToday(now, preferHour, fallbackMs) {
	const start = startOfLocalDay(now);
	const prefer = start + preferHour * HOUR;
	if (prefer < now) return prefer;
	return Math.max(start + 1e3, now - fallbackMs);
}
function makeSeed(now = Date.now()) {
	const parties = [
		{
			id: "rahim",
			name: "রহিম স্টোর",
			aliases: [
				"রহিম স্টোর",
				"রহিম স্টোরে",
				"রহিমের দোকান",
				"রহিমের দোকানে",
				"রহিম"
			],
			role: "customer"
		},
		{
			id: "karim",
			name: "করিম স্টোর",
			aliases: [
				"করিম স্টোর",
				"করিমের কাছ",
				"করিমের দোকান",
				"করিম"
			],
			role: "customer"
		},
		{
			id: "nur",
			name: "নুরের দোকান",
			aliases: [
				"নুরের দোকান",
				"নুরের দোকানে",
				"নুর"
			],
			role: "customer"
		},
		{
			id: "salma",
			name: "সালমা স্টোর",
			aliases: [
				"সালমা স্টোর",
				"সালমার দোকান",
				"সালমা"
			],
			role: "customer"
		},
		{
			id: "kamal",
			name: "কামাল ট্রেডার্স",
			aliases: ["কামাল ট্রেডার্স", "কামাল"],
			role: "supplier"
		}
	];
	const products = [{
		id: "lighter",
		name: "লাইটার",
		aliases: ["লাইটার", "লাইটারের"],
		packName: "কেস",
		packSize: 50,
		pricePaisa: 1e3,
		costPaisa: 600
	}, {
		id: "soap",
		name: "সাবান",
		aliases: ["সাবান"],
		packName: "প্যাকেট",
		packSize: 12,
		pricePaisa: 2500,
		costPaisa: 1800
	}];
	let books = {
		version: 1,
		businessName: "রফিক ট্রেডার্স",
		mode: "stock",
		parties,
		products,
		entries: []
	};
	books = apply(books, buildOpening({
		id: "seed-open",
		at: now - 6 * DAY,
		cashPaisa: 5e5,
		products,
		stock: [{
			productId: "lighter",
			qty: 3970,
			costPaisa: 600
		}, {
			productId: "soap",
			qty: 120,
			costPaisa: 1800
		}]
	}));
	books = apply(books, buildSale(books, {
		id: "seed-rahim",
		at: now - 5 * DAY,
		partyId: "rahim",
		productId: "lighter",
		qty: 800,
		unitPricePaisa: 1e3,
		receivedPaisa: 0
	}));
	books = apply(books, buildSale(books, {
		id: "seed-salma",
		at: now - 3 * DAY,
		partyId: "salma",
		productId: "lighter",
		qty: 370,
		unitPricePaisa: 1e3,
		receivedPaisa: 0
	}));
	books = apply(books, buildConsign(books, {
		id: "seed-consign",
		at: now - 2 * DAY,
		partyId: "rahim",
		productId: "lighter",
		qty: 50
	}));
	books = apply(books, buildSale(books, {
		id: "seed-karim",
		at: earlierToday(now, 9, 54e5),
		partyId: "karim",
		productId: "lighter",
		qty: 150,
		unitPricePaisa: 1e3,
		receivedPaisa: 1e5
	}));
	books = apply(books, buildSale(books, {
		id: "seed-nur",
		at: earlierToday(now, 11, 18e5),
		partyId: "nur",
		productId: "lighter",
		qty: 100,
		unitPricePaisa: 1e3,
		receivedPaisa: 8e4
	}));
	return books;
}
var KEY = "hishab-sathi-v1";
function emptyBooks() {
	return {
		version: 1,
		businessName: "",
		mode: "stock",
		parties: [],
		products: [],
		entries: []
	};
}
function persist(books) {
	try {
		localStorage.setItem(KEY, JSON.stringify(books));
		return true;
	} catch {
		return false;
	}
}
function readBooks() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const books = JSON.parse(raw);
		if (books.version !== 1 || !Array.isArray(books.entries) || !Array.isArray(books.parties)) return null;
		return books;
	} catch {
		return null;
	}
}
var useHishab = create((set, get) => ({
	books: emptyBooks(),
	nav: [{ id: "home" }],
	draft: null,
	ready: false,
	saved: true,
	toast: null,
	hydrate: () => {
		if (get().ready) return;
		const books = readBooks() ?? makeSeed();
		set({
			books,
			ready: true,
			saved: persist(books)
		});
	},
	goTab: (id) => set({
		nav: [{ id }],
		draft: null
	}),
	push: (screen) => set({ nav: [...get().nav, screen] }),
	back: () => {
		const nav = get().nav;
		if (nav.length <= 1) return;
		set({
			nav: nav.slice(0, -1),
			draft: nav[nav.length - 1]?.id === "flow" ? null : get().draft
		});
	},
	openDraft: (draft) => {
		const nav = get().nav;
		const top = nav[nav.length - 1];
		set({
			draft,
			nav: top?.id === "flow" ? nav : [...nav, { id: "flow" }]
		});
	},
	patchDraft: (patch) => {
		const draft = get().draft;
		if (!draft) return;
		set({ draft: {
			...draft,
			...patch
		} });
	},
	flowBack: (step) => {
		if (step === "exit") {
			const nav = get().nav;
			set({
				draft: null,
				nav: nav[nav.length - 1]?.id === "flow" ? nav.slice(0, -1) : nav
			});
			return;
		}
		get().patchDraft({ step });
	},
	commitEntry: (entry) => {
		const books = apply(get().books, entry);
		const saved = persist(books);
		const nav = get().nav.filter((screen) => screen.id !== "flow");
		nav.push({
			id: "receipt",
			entryId: entry.id
		});
		set({
			books,
			saved,
			nav,
			draft: null,
			toast: "হিসাব সেভ হয়েছে"
		});
	},
	addParty: (name, role) => {
		const trimmed = name.trim();
		if (!trimmed) throw new Error("দোকানের নাম লিখুন।");
		const id = `p-${crypto.randomUUID()}`;
		const party = {
			id,
			name: trimmed,
			aliases: [trimmed],
			role
		};
		const books = {
			...get().books,
			parties: [...get().books.parties, party]
		};
		set({
			books,
			saved: persist(books)
		});
		return id;
	},
	addProduct: (input) => {
		const name = input.name.trim();
		if (!name) throw new Error("মালের নাম লিখুন।");
		if (!Number.isInteger(input.packSize) || input.packSize < 1) throw new Error("কেসে কত পিস, সেটা বলুন।");
		const id = `g-${crypto.randomUUID()}`;
		const product = {
			id,
			name,
			aliases: [name],
			packName: input.packName.trim() || "কেস",
			packSize: input.packSize,
			pricePaisa: takaToPaisa(input.priceTaka),
			costPaisa: takaToPaisa(input.costTaka)
		};
		let books = {
			...get().books,
			products: [...get().books.products, product]
		};
		if (input.qty > 0) books = apply(books, buildStockAdd(books, {
			id: crypto.randomUUID(),
			at: Date.now(),
			productId: id,
			qty: input.qty,
			costPaisa: product.costPaisa
		}));
		set({
			books,
			saved: persist(books),
			toast: "মাল যোগ হয়েছে"
		});
		return id;
	},
	setMode: (mode) => {
		const books = {
			...get().books,
			mode
		};
		set({
			books,
			saved: persist(books)
		});
	},
	resetDemo: () => {
		const books = makeSeed();
		set({
			books,
			saved: persist(books),
			nav: [{ id: "home" }],
			draft: null,
			toast: "ডেমো হিসাব আবার বসানো হয়েছে"
		});
	},
	dismissToast: () => set({ toast: null })
}));
function Recog() {
	if (typeof window === "undefined") return null;
	const w = window;
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
function canListen() {
	return Recog() != null;
}
function listenBangla() {
	const Ctor = Recog();
	if (!Ctor) return Promise.reject(/* @__PURE__ */ new Error("no-mic"));
	return new Promise((resolve, reject) => {
		const rec = new Ctor();
		rec.lang = "bn-BD";
		rec.interimResults = false;
		rec.maxAlternatives = 1;
		let settled = false;
		rec.onresult = (event) => {
			settled = true;
			resolve(event.results[0]?.[0]?.transcript ?? "");
		};
		rec.onerror = () => {
			if (!settled) reject(/* @__PURE__ */ new Error("mic"));
		};
		rec.onend = () => {
			if (!settled) reject(/* @__PURE__ */ new Error("mic"));
		};
		try {
			rec.start();
		} catch {
			reject(/* @__PURE__ */ new Error("mic"));
		}
	});
}
function speakBangla(text) {
	if (typeof window === "undefined" || !window.speechSynthesis) return false;
	window.speechSynthesis.cancel();
	const utter = new SpeechSynthesisUtterance(text);
	utter.lang = "bn-BD";
	window.speechSynthesis.speak(utter);
	return true;
}
var REASONS = [
	"বিক্রি হয়নি",
	"মাল ভাঙা",
	"ভুল করে দিয়েছি",
	"অন্যান্য"
];
var EXPENSES = [
	"ভাড়া",
	"পরিবহন",
	"চা-নাস্তা",
	"বিদ্যুৎ",
	"অন্যান্য"
];
function FlowScreen() {
	const books = useHishab((s) => s.books);
	const draft = useHishab((s) => s.draft);
	const patchDraft = useHishab((s) => s.patchDraft);
	const flowBack = useHishab((s) => s.flowBack);
	if (!draft) return null;
	const steps = stepsFor(draft, books.mode);
	const index = Math.max(steps.indexOf(draft.step), 0);
	const back = () => {
		if (index <= 0) flowBack("exit");
		else flowBack(steps[index - 1] ?? "exit");
	};
	const jump = (step) => patchDraft({ step });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-flow": draft.kind,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
				title: titleOf(draft),
				onBack: back
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-4 pb-2 text-sm text-ink-soft",
				children: [
					"ধাপ ",
					toBn(Math.min(index + 1, steps.length)),
					" / ",
					toBn(steps.length)
				]
			}),
			draft.step === "party" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartyStep, { onNext: jump }) : null,
			draft.step === "product" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductStep, { onNext: jump }) : null,
			draft.step === "money" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyStep, { onNext: jump }) : null,
			draft.step === "reason" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReasonStep, { onNext: jump }) : null,
			draft.step === "confirm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmStep, { onEdit: jump }) : null
		]
	});
}
function titleOf(draft) {
	if (draft.kind === "sale" && draft.fromConsignment) return "রাখা মাল বিক্রি";
	if (draft.kind === "sale") return "বিক্রি করেছি";
	if (draft.kind === "collection") return "টাকা পেয়েছি";
	if (draft.kind === "consign") return "মাল রেখেছি";
	if (draft.kind === "return") return "মাল ফেরত";
	if (draft.kind === "purchase") return "মাল এনেছি";
	return "খরচ করেছি";
}
function PartyStep({ onNext }) {
	const books = useHishab((s) => s.books);
	const draft = useHishab((s) => s.draft);
	const patchDraft = useHishab((s) => s.patchDraft);
	const addParty = useHishab((s) => s.addParty);
	const [query, setQuery] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const role = draft.kind === "purchase" ? "supplier" : "customer";
	const parties = books.parties.filter((party) => role === "supplier" ? true : party.role === "customer").filter((party) => party.name.includes(query.trim())).sort((a, b) => balance(books, "receivable", b.id) - balance(books, "receivable", a.id));
	const choose = (party) => {
		patchDraft({
			partyId: party.id,
			partySkipped: false
		});
		onNext(nextAfter("party", draft, books.mode));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
			label: role === "supplier" ? "কার কাছ থেকে" : "কোন দোকান",
			value: query,
			onChange: setQuery,
			placeholder: "নাম লিখে খুঁজুন"
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
			tone: "warn",
			title: "হয়নি",
			body: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2",
			children: parties.map((party) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
				title: party.name,
				selected: draft.partyId === party.id,
				detail: partyDetail(books, party, draft.kind),
				onClick: () => choose(party)
			}, party.id))
		}),
		query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Secondary, {
			onClick: () => {
				try {
					const id = addParty(query, role === "supplier" ? "supplier" : "customer");
					patchDraft({
						partyId: id,
						partySkipped: false
					});
					onNext(nextAfter("party", draft, books.mode));
				} catch (err) {
					setError(err instanceof Error ? err.message : "যোগ হয়নি");
				}
			},
			children: [
				"“",
				query.trim(),
				"” নতুন যোগ করুন"
			]
		}) : null,
		draft.kind === "purchase" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
			onClick: () => {
				patchDraft({
					partyId: void 0,
					partySkipped: true
				});
				onNext(nextAfter("party", draft, books.mode));
			},
			children: "কারো নাম নেই, নগদ কিনেছি"
		}) : null,
		draft.kind === "sale" && !draft.productId && books.mode === "khata" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
			onClick: () => {
				patchDraft({
					partyId: void 0,
					partySkipped: true
				});
				onNext("money");
			},
			children: "দোকান নেই — নগদ বিক্রি"
		}) : null
	] });
}
function partyDetail(books, party, kind) {
	const due = balance(books, "receivable", party.id);
	const held = productsAt(books, partyLoc(party.id));
	const bits = [due > 0 ? `পাওনা ${formatTaka(due)}` : "পাওনা নেই"];
	if (held.length) bits.push("রাখা মাল আছে");
	if (kind === "purchase" && party.role === "supplier") bits.push("সরবরাহকারী");
	return bits.join(" · ");
}
function ProductStep({ onNext }) {
	const books = useHishab((s) => s.books);
	const draft = useHishab((s) => s.draft);
	const patchDraft = useHishab((s) => s.patchDraft);
	const product = productById(books, draft.productId);
	const [error, setError] = (0, import_react.useState)("");
	const pick = (item) => {
		patchDraft({
			productId: item.id,
			unitPriceTaka: Math.round(item.pricePaisa / 100),
			costTaka: Math.round(item.costPaisa / 100),
			unit: item.packSize > 1 ? "pack" : "pcs"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2",
			children: books.products.map((item) => {
				const where = draft.fromConsignment && draft.partyId ? stockAt(books, item.id, partyLoc(draft.partyId)) : stockAt(books, item.id, WAREHOUSE);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					title: item.name,
					selected: draft.productId === item.id,
					detail: `${draft.fromConsignment ? "রাখা আছে" : "গুদামে"} ${formatQty(where, item.packSize, item.packName)} · প্রতি পিস ${formatTaka(item.pricePaisa)}`,
					onClick: () => pick(item)
				}, item.id);
			})
		}),
		product ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-card p-4 ring-1 ring-line",
			children: [
				product.packSize > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitButton, {
						active: draft.unit === "pack",
						onClick: () => patchDraft({ unit: "pack" }),
						label: product.packName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitButton, {
						active: draft.unit === "pcs",
						onClick: () => patchDraft({ unit: "pcs" }),
						label: "পিস"
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "কমান",
							onClick: () => patchDraft({ qtyInput: Math.max(0, draft.qtyInput - 1) }),
							className: "grid size-14 place-items-center rounded-full bg-paper-deep font-display text-2xl text-ink",
							children: "−"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-4xl font-semibold text-ink tabular-nums",
							children: toBn(draft.qtyInput)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "বাড়ান",
							onClick: () => patchDraft({ qtyInput: draft.qtyInput + 1 }),
							className: "grid size-14 place-items-center rounded-full bg-palm font-display text-2xl text-paper",
							children: "+"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid grid-cols-3 gap-2",
					children: [
						1,
						2,
						5
					].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => patchDraft({ qtyInput: n }),
						className: "min-h-12 rounded-xl bg-paper-deep font-display text-base font-semibold text-ink",
						children: toBn(n)
					}, n))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-center text-sm text-ink-soft",
					children: draft.unit === "pack" ? `${toBn(draft.qtyInput)} ${product.packName} = ${toBnGrouped(piecesOf({
						...draft,
						productId: product.id
					}, product.packSize))} পিস` : `${toBnGrouped(draft.qtyInput)} পিস`
				})
			]
		}) : null,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
			tone: "warn",
			title: "হয়নি",
			body: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
			onClick: () => {
				if (!draft.productId || draft.qtyInput <= 0) {
					setError("মাল আর কয়টা, দুটোই বাছুন।");
					return;
				}
				if (draft.kind === "purchase" && product) patchDraft({ paidTaka: piecesOf(draft, product.packSize) * draft.costTaka });
				onNext(nextAfter("product", draft, books.mode));
			},
			children: "পরের ধাপ"
		})
	] });
}
function UnitButton({ active, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `min-h-12 rounded-xl font-display text-base font-semibold ${active ? "bg-palm text-paper" : "bg-paper-deep text-ink"}`,
		children: label
	});
}
function MoneyStep({ onNext }) {
	const books = useHishab((s) => s.books);
	const draft = useHishab((s) => s.draft);
	const patchDraft = useHishab((s) => s.patchDraft);
	const pieces = piecesOf(draft, productById(books, draft.productId)?.packSize ?? 1);
	const stockSale = Boolean(draft.productId) || books.mode === "stock";
	const saleTotal = stockSale && draft.kind === "sale" ? pieces * draft.unitPriceTaka : draft.amountTaka;
	const dueParty = draft.partyId ? Math.round(balance(books, "receivable", draft.partyId) / 100) : 0;
	const purchaseTotal = pieces * draft.costTaka;
	const [field, setField] = (0, import_react.useState)(draft.kind === "purchase" ? "paid" : draft.kind === "sale" && stockSale ? "got" : "amount");
	const [error, setError] = (0, import_react.useState)("");
	const current = field === "price" ? draft.unitPriceTaka : field === "got" ? draft.receivedTaka : field === "cost" ? draft.costTaka : field === "paid" ? draft.paidTaka : draft.amountTaka;
	const write = (value) => {
		if (field === "price") patchDraft({ unitPriceTaka: value });
		else if (field === "got") patchDraft({
			receivedTaka: value,
			receivedKnown: true
		});
		else if (field === "cost") patchDraft({ costTaka: value });
		else if (field === "paid") patchDraft({ paidTaka: value });
		else patchDraft({ amountTaka: value });
	};
	const finish = () => {
		if (draft.kind === "expense") {
			if (!draft.expenseLabel || draft.amountTaka <= 0) {
				setError("খরচের নাম আর টাকা দুটোই দিন।");
				return;
			}
			onNext("confirm");
			return;
		}
		if (draft.kind === "collection") {
			if (draft.amountTaka <= 0) {
				setError("কত পেয়েছেন, সেটা দিন।");
				return;
			}
			if (draft.amountTaka > dueParty) {
				setError(`পাওনা ${toBnGrouped(dueParty)} টাকা। তার বেশি আদায় হবে না।`);
				return;
			}
			onNext("confirm");
			return;
		}
		if (draft.kind === "purchase") {
			if (draft.costTaka <= 0) {
				setError("কেনা দাম দিন।");
				return;
			}
			if (draft.paidTaka > purchaseTotal) {
				setError("মোট কেনার চেয়ে বেশি দেওয়া হয়েছে।");
				return;
			}
			if (purchaseTotal - draft.paidTaka > 0 && !draft.partyId) {
				setError("বাকি রাখতে কার কাছ থেকে কিনেছেন, সেটা লাগবে।");
				return;
			}
			patchDraft({ paidKnown: true });
			onNext("confirm");
			return;
		}
		if (draft.kind === "sale" && stockSale) {
			if (draft.unitPriceTaka <= 0) {
				setError("প্রতি পিসের দাম দিন।");
				return;
			}
			if (draft.receivedTaka > saleTotal) {
				setError("মোট বিক্রির চেয়ে বেশি টাকা।");
				return;
			}
			if (saleTotal - draft.receivedTaka > 0 && !draft.partyId) {
				setError("বাকি রাখতে দোকানের নাম লাগবে।");
				return;
			}
			patchDraft({ receivedKnown: true });
			onNext("confirm");
			return;
		}
		if (draft.amountTaka <= 0) {
			setError("বিক্রির টাকা দিন।");
			return;
		}
		if (draft.receivedTaka > draft.amountTaka) {
			setError("মোট বিক্রির চেয়ে বেশি টাকা।");
			return;
		}
		if (draft.amountTaka - draft.receivedTaka > 0 && !draft.partyId) {
			setError("বাকি রাখতে দোকানের নাম লাগবে।");
			return;
		}
		patchDraft({ receivedKnown: true });
		onNext("confirm");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		draft.kind === "collection" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-clay-soft px-4 py-3 ring-1 ring-clay",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ink",
				children: "এই দোকানের পাওনা"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl font-semibold text-ink tabular-nums",
				children: formatTaka(dueParty * 100)
			})]
		}) : null,
		draft.kind === "expense" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: EXPENSES.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => patchDraft({ expenseLabel: label }),
				className: `min-h-12 rounded-full px-4 font-display text-base font-semibold ${draft.expenseLabel === label ? "bg-palm text-paper" : "bg-card text-ink ring-1 ring-line"}`,
				children: label
			}, label))
		}) : null,
		draft.kind === "sale" && stockSale ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "প্রতি পিস দাম",
				value: draft.unitPriceTaka,
				active: field === "price",
				onClick: () => setField("price")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "মোট বিক্রি",
				value: saleTotal
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "টাকা পেয়েছি",
				value: draft.receivedTaka,
				active: field === "got",
				onClick: () => setField("got")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "বাকি থাকবে",
				value: Math.max(saleTotal - draft.receivedTaka, 0)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						label: "সব পেয়েছি",
						onClick: () => {
							setField("got");
							patchDraft({
								receivedTaka: saleTotal,
								receivedKnown: true
							});
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						label: "কিছুই না",
						onClick: () => {
							setField("got");
							patchDraft({
								receivedTaka: 0,
								receivedKnown: true
							});
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						label: "অর্ধেক",
						onClick: () => {
							setField("got");
							patchDraft({
								receivedTaka: Math.round(saleTotal / 2),
								receivedKnown: true
							});
						}
					})
				]
			})
		] }) : null,
		draft.kind === "sale" && !stockSale ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "মোট বিক্রি",
				value: draft.amountTaka,
				active: field === "amount",
				onClick: () => setField("amount")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "টাকা পেয়েছি",
				value: draft.receivedTaka,
				active: field === "got",
				onClick: () => setField("got")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "বাকি থাকবে",
				value: Math.max(draft.amountTaka - draft.receivedTaka, 0)
			})
		] }) : null,
		draft.kind === "collection" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "এখন পেয়েছি",
			value: draft.amountTaka,
			active: true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
			label: "পুরো পাওনা",
			onClick: () => patchDraft({ amountTaka: dueParty })
		})] }) : null,
		draft.kind === "purchase" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "প্রতি পিস কেনা দাম",
				value: draft.costTaka,
				active: field === "cost",
				onClick: () => setField("cost")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "মোট কেনা",
				value: purchaseTotal
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "এখন দিয়েছি",
				value: draft.paidTaka,
				active: field === "paid",
				onClick: () => setField("paid")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "পরে দেব",
				value: Math.max(purchaseTotal - draft.paidTaka, 0)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					label: "সব দিয়েছি",
					onClick: () => {
						setField("paid");
						patchDraft({ paidTaka: purchaseTotal });
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					label: "পরে দেব",
					onClick: () => {
						setField("paid");
						patchDraft({ paidTaka: 0 });
					}
				})]
			})
		] }) : null,
		draft.kind === "expense" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "খরচের টাকা",
			value: draft.amountTaka,
			active: true
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumPad, {
			onDigit: (n) => write(pushDigit(current, n)),
			onBack: () => write(popDigit(current)),
			onClear: () => write(0)
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
			tone: "warn",
			title: "ঠিক করুন",
			body: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
			onClick: finish,
			children: "হিসাব দেখুন"
		})
	] });
}
function Chip({ label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "min-h-12 rounded-xl bg-paper-deep px-2 font-display text-sm font-semibold text-ink",
		children: label
	});
}
function ReasonStep({ onNext }) {
	const draft = useHishab((s) => s.draft);
	const patchDraft = useHishab((s) => s.patchDraft);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
				title: "বিক্রি করা মাল ফেরত",
				detail: "বিক্রি কমবে, পাওনা বা নগদ কমবে",
				selected: draft.reasonKnown && draft.returnMode === "sold",
				onClick: () => patchDraft({
					returnMode: "sold",
					reasonKnown: true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
				title: "রাখা মাল ফিরিয়ে এনেছি",
				detail: "বিক্রি নয়। মাল আবার গুদামে",
				selected: draft.reasonKnown && draft.returnMode === "consign",
				onClick: () => patchDraft({
					returnMode: "consign",
					reasonKnown: true
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: REASONS.map((reason) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => patchDraft({ expenseLabel: reason }),
				className: `min-h-12 rounded-full px-4 text-sm font-semibold ${draft.expenseLabel === reason ? "bg-ink text-paper" : "bg-card text-ink ring-1 ring-line"}`,
				children: reason
			}, reason))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
			disabled: !draft.reasonKnown,
			onClick: () => onNext("confirm"),
			children: "হিসাব দেখুন"
		})
	] });
}
function ConfirmStep({ onEdit }) {
	const books = useHishab((s) => s.books);
	const draft = useHishab((s) => s.draft);
	const commitEntry = useHishab((s) => s.commitEntry);
	const idRef = (0, import_react.useRef)(crypto.randomUUID());
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [spoken, setSpoken] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const view = previewDraft(books, draft);
	const edit = () => {
		onEdit([...stepsFor(draft, books.mode)].reverse().find((step) => step !== "confirm") ?? "party");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		draft.notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
			title: "মিলিয়ে নিন",
			body: note
		}, note)),
		view.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			view.banner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
				title: view.banner.title,
				body: view.banner.body,
				tone: view.banner.title.includes("নয়") ? "warn" : "info"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl bg-card p-4 ring-1 ring-line",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-semibold text-ink",
						children: view.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "mt-3 flex flex-col gap-2",
						children: view.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-sm text-ink-soft",
								children: row.k
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "text-right font-display text-lg font-semibold text-ink",
								children: row.v
							})]
						}, row.k))
					}),
					view.foot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-ink-soft",
						children: view.foot
					}) : null
				]
			}),
			view.after.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl bg-palm-soft p-4",
				children: view.after.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-baseline justify-between gap-3 py-1 text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm",
						children: row.k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-semibold",
						children: row.v
					})]
				}, row.k))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl bg-ink px-4 py-4 text-paper",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-foam",
						children: "শুনে যাচাই করুন"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-lg leading-relaxed",
						children: view.readback
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSpoken(speakBangla(view.readback)),
						className: "mt-3 flex min-h-12 items-center gap-2 rounded-full bg-saffron px-4 font-display text-base font-semibold text-ink",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
							className: "size-5",
							"aria-hidden": "true"
						}), spoken ? "আবার শুনুন" : "শুনুন"]
					})
				]
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
			tone: "warn",
			title: "সেভ হবে না",
			body: view.error
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
			tone: "warn",
			title: "সেভ হয়নি",
			body: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
				onClick: edit,
				children: "ঠিক করুন"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: !view.ok || saving,
				onClick: () => {
					if (!view.ok || saving) return;
					setSaving(true);
					try {
						commitEntry(entryFromDraft(books, draft, idRef.current));
					} catch (err) {
						setSaving(false);
						setError(err instanceof Error ? err.message : "সেভ হয়নি");
					}
				},
				className: "flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-palm px-3 font-display text-base font-semibold text-paper disabled:opacity-40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "size-5",
					"aria-hidden": "true"
				}), "সেভ করুন"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-center text-sm text-ink-soft",
			children: "কথা নিজে থেকে টাকা বদলায় না। সেভ আপনি চাপলেই।"
		})
	] });
}
function nextAfter(step, draft, mode) {
	const steps = stepsFor(draft, mode);
	return steps[steps.indexOf(step) + 1] ?? "confirm";
}
function ReceiptScreen({ entryId }) {
	const books = useHishab((s) => s.books);
	const back = useHishab((s) => s.back);
	const goTab = useHishab((s) => s.goTab);
	const entry = books.entries.find((item) => item.id === entryId);
	if (!entry) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "হিসাব",
		onBack: back
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
		title: "পাওয়া যায়নি",
		body: "এই হিসাবটা খাতায় নেই।"
	})] });
	const view = explain(books, entry);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "হিসাব সেভ হয়েছে",
		onBack: () => goTab("home")
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-palm px-4 py-5 text-paper",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-foam",
					children: "এই ফোনে সেভ হয়েছে"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-3xl font-semibold",
					children: view.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-base leading-relaxed",
					children: entry.summary
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-card p-4 ring-1 ring-line",
			children: [
				view.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-baseline justify-between gap-3 py-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-ink-soft",
						children: row.k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-semibold text-ink",
						children: row.v
					})]
				}, row.k)),
				view.foot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink-soft",
					children: view.foot
				}) : null,
				entry.partyId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-ink-soft",
						children: "এখন পাওনা"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-semibold text-ink",
						children: formatTaka(balance(books, "receivable", entry.partyId))
					})]
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
			onClick: () => goTab("home"),
			children: "আজকের হিসাবে ফিরুন"
		})
	] })] });
}
function beginDraft(kind, books, extra = {}) {
	const draft = blankDraft(kind, extra);
	const product = productById(books, draft.productId);
	if (product) {
		if (!extra.unitPriceTaka) draft.unitPriceTaka = Math.round(product.pricePaisa / 100);
		if (!extra.costTaka) draft.costTaka = Math.round(product.costPaisa / 100);
	}
	draft.step = firstGap(draft, books);
	return draft;
}
var SAMPLES = {
	sale: "রহিম স্টোরে দুই কেস লাইটার বিক্রি করেছি। প্রতি পিস দশ টাকা। ছয়শ টাকা পেয়েছি।",
	collect: "করিমের কাছ থেকে পাঁচশ টাকা পেয়েছি",
	consign: "নুরের দোকানে এক কেস লাইটার রেখে এসেছি"
};
var PACK_UNIT = /কেস|কেইস|প্যাকেট|কার্টুন|বস্তা/;
var RECEIVED = /পেয়েছি|পেয়েছি|পেলাম|পেরেছি/;
function parseUtterance(input, books) {
	const text = normalizeText(input);
	const notes = [];
	if (!text) return {
		kind: null,
		notes: ["কী হয়েছে, এক লাইনে বলুন।"]
	};
	const sale = /বিক্রি/.test(text);
	const consign = /রেখে\s*এসেছি|রেখেছি|রেখে\s*এসে/.test(text);
	const returned = /ফেরত|ফিরিয়ে|ফিরে এনে/.test(text);
	const expense = /খরচ/.test(text);
	const purchase = /কিনেছি|কিনে এনে|মাল এনে/.test(text);
	const gotPaid = RECEIVED.test(text) || /আদায়|আদায়/.test(text);
	if (sale && consign) return {
		kind: null,
		notes: ["এক বাক্যে বিক্রি আর মাল রাখা দুটোই আছে। একটা করে বলুন।"]
	};
	let kind = null;
	if (returned) kind = "return";
	else if (consign) kind = "consign";
	else if (expense) kind = "expense";
	else if (purchase) kind = "purchase";
	else if (sale) kind = "sale";
	else if (gotPaid) kind = "collection";
	if (!kind) return {
		kind: null,
		notes: ["বুঝিনি। বিক্রি, টাকা পাওয়া, মাল রাখা, ফেরত, কেনা, বা খরচ — একটা বলুন।"]
	};
	const party = findParty(text, books.parties.filter((item) => item.role === "customer" || kind === "purchase"));
	const product = findProduct(text, books.products);
	const qty = findQty(text);
	const price = findPrice(text);
	const received = findReceived(text);
	const fromConsignment = /রাখা মাল|কনসাইন/.test(text);
	const payFull = /সব টাকা পে|পুরোটা পে|পুরো টাকা পে|নগদ বিক্রি/.test(text);
	const result = {
		kind,
		notes,
		partyId: party?.id,
		productId: product?.id,
		fromConsignment,
		payFull
	};
	if (qty) {
		result.qtyInput = qty.qty;
		result.unit = qty.unit;
	}
	if (price != null) result.unitPriceTaka = price;
	if (received != null) {
		result.receivedTaka = received;
		result.receivedKnown = true;
		result.amountTaka = received;
	}
	if (kind === "expense") {
		result.expenseLabel = expenseLabel(text);
		const amount = received ?? lastMoney(text);
		if (amount != null) result.amountTaka = amount;
	}
	if (kind === "purchase") {
		if (price != null) result.costTaka = price;
		const supplier = findParty(text, books.parties);
		if (supplier) result.partyId = supplier.id;
	}
	if (kind === "return") result.returnMode = /রাখা/.test(text) ? "consign" : "sold";
	if (kind === "sale" && !product && received != null && qty == null) result.amountTaka = received;
	if (kind === "sale" && !product && price != null && received == null) result.amountTaka = price;
	return result;
}
function draftFromParse(text, result, books) {
	if (!result.kind) throw new Error(result.notes[0] ?? "বুঝিনি।");
	const product = books.products.find((item) => item.id === result.productId);
	const notes = [...result.notes];
	const draft = {
		kind: result.kind,
		step: "confirm",
		partyId: result.partyId,
		productId: result.productId,
		unit: result.unit ?? "pack",
		qtyInput: result.qtyInput ?? 0,
		unitPriceTaka: result.unitPriceTaka ?? (product ? Math.round(product.pricePaisa / 100) : 0),
		receivedTaka: result.receivedTaka ?? 0,
		receivedKnown: Boolean(result.receivedKnown),
		amountTaka: result.amountTaka ?? 0,
		paidTaka: 0,
		paidKnown: false,
		costTaka: result.costTaka ?? (product ? Math.round(product.costPaisa / 100) : 0),
		expenseLabel: result.expenseLabel ?? "",
		returnMode: result.returnMode ?? "sold",
		reasonKnown: result.kind === "return",
		fromConsignment: Boolean(result.fromConsignment),
		partySkipped: false,
		utterance: text,
		notes
	};
	if (draft.kind === "sale" && result.payFull && draft.productId && draft.qtyInput > 0) {
		const pack = product?.packSize ?? 1;
		draft.receivedTaka = (draft.unit === "pack" ? draft.qtyInput * pack : draft.qtyInput) * draft.unitPriceTaka;
		draft.receivedKnown = true;
	} else if (draft.kind === "sale" && !result.receivedKnown) {
		draft.receivedTaka = 0;
		draft.receivedKnown = true;
		notes.push("কত টাকা পেয়েছেন বলেননি। শূন্য ধরা হয়েছে — পুরোটা বাকি।");
	}
	if (draft.kind === "sale" && result.unitPriceTaka == null && product && (books.mode === "stock" || draft.productId)) notes.push("দাম আগের মতো ধরা হয়েছে। মিলিয়ে নিন।");
	if (draft.kind === "collection" && result.receivedTaka != null) draft.amountTaka = result.receivedTaka;
	if (draft.kind === "purchase") draft.paidKnown = false;
	return draft;
}
function findParty(text, parties) {
	return parties.flatMap((party) => [party.name, ...party.aliases].map((alias) => ({
		party,
		alias: normalizeText(alias)
	}))).filter((item) => item.alias.length >= 2).sort((a, b) => b.alias.length - a.alias.length).find((item) => text.includes(item.alias))?.party;
}
function findProduct(text, products) {
	return products.flatMap((product) => [product.name, ...product.aliases].map((alias) => ({
		product,
		alias: normalizeText(alias)
	}))).filter((item) => item.alias.length >= 2).sort((a, b) => b.alias.length - a.alias.length).find((item) => text.includes(item.alias))?.product;
}
function findQty(text) {
	const pack = numberBeforeUnit(text, PACK_UNIT, 3);
	if (pack != null) return {
		qty: pack,
		unit: "pack"
	};
	const re = /পিস|পিছ/g;
	let match;
	while (match = re.exec(text)) {
		const near = text.slice(Math.max(0, match.index - 8), match.index);
		if (/প্রতি\s*$/.test(near)) continue;
		const slice = text.slice(0, match.index);
		const qty = amountEndingBefore(slice, slice.length, 3);
		if (qty != null) return {
			qty,
			unit: "pcs"
		};
	}
	return null;
}
function findPrice(text) {
	const at = text.search(/প্রতি/);
	if (at < 0) return null;
	return scanAmounts(text.slice(at, at + 40))[0]?.value ?? null;
}
function findReceived(text) {
	const match = RECEIVED.exec(text);
	if (!match) return null;
	return amountEndingBefore(text, match.index, 14);
}
function lastMoney(text) {
	const nums = scanAmounts(text);
	return nums.length ? nums[nums.length - 1].value : null;
}
function amountEndingBefore(text, index, gap) {
	const nums = scanAmounts(text.slice(0, index));
	if (!nums.length) return null;
	const last = nums[nums.length - 1];
	if (index - last.end > gap) return null;
	return last.value;
}
function numberBeforeUnit(text, unit, gap) {
	const match = unit.exec(text);
	if (!match) return null;
	return amountEndingBefore(text, match.index, gap);
}
function expenseLabel(text) {
	if (/ভাড়া|ভাড়া/.test(text) && !/গাড়ি|গাড়ি/.test(text)) return "ভাড়া";
	if (/পরিবহন|গাড়ি|গাড়ি|ভাড়া/.test(text)) return "পরিবহন";
	if (/নাস্তা|চা/.test(text)) return "চা-নাস্তা";
	if (/বিদ্যুৎ|বিদ্যুৎ|কারেন্ট|বিল/.test(text)) return "বিদ্যুৎ";
	return "অন্যান্য";
}
function useOpen() {
	const books = useHishab((s) => s.books);
	const openDraft = useHishab((s) => s.openDraft);
	return (kind, extra) => openDraft(beginDraft(kind, books, extra));
}
function HomeScreen() {
	const books = useHishab((s) => s.books);
	const saved = useHishab((s) => s.saved);
	const push = useHishab((s) => s.push);
	const openDraft = useHishab((s) => s.openDraft);
	const open = useOpen();
	const now = Date.now();
	const start = startOfLocalDay(now);
	const end = start + 864e5;
	const [utterance, setUtterance] = (0, import_react.useState)("");
	const [listening, setListening] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const lighter = books.products.find((product) => product.id === "lighter") ?? books.products[0];
	const recent = books.entries.filter((entry) => entry.kind !== "opening").slice(-4).reverse();
	const actions = books.mode === "stock" ? [
		{
			kind: "sale",
			label: "বিক্রি করেছি",
			hint: "মাল ও টাকা",
			icon: ShoppingBag
		},
		{
			kind: "collection",
			label: "টাকা পেয়েছি",
			hint: "পুরনো বাকি",
			icon: Banknote
		},
		{
			kind: "consign",
			label: "মাল রেখেছি",
			hint: "এটা বিক্রি নয়",
			icon: Store
		},
		{
			kind: "return",
			label: "মাল ফেরত",
			hint: "মাল ফিরে এল",
			icon: Undo2
		}
	] : [
		{
			kind: "sale",
			label: "বিক্রি করেছি",
			hint: "নগদ বা বাকি",
			icon: ShoppingBag
		},
		{
			kind: "collection",
			label: "টাকা পেয়েছি",
			hint: "পুরনো বাকি",
			icon: Banknote
		},
		{
			kind: "purchase",
			label: "মাল এনেছি",
			hint: "গুদামে যোগ",
			icon: PackagePlus
		},
		{
			kind: "expense",
			label: "খরচ করেছি",
			hint: "ভাড়া, চা, রাস্তা",
			icon: Receipt
		}
	];
	const submit = (text) => {
		const parsed = parseUtterance(text, books);
		if (!parsed.kind) {
			setError(parsed.notes[0] ?? "বুঝিনি। বোতাম দিয়ে হিসাব লিখুন।");
			return;
		}
		const draft = draftFromParse(text, parsed, books);
		draft.step = firstGap(draft, books);
		setError("");
		openDraft(draft);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "bg-palm px-4 pt-5 pb-4 text-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "হিসাব সাথী"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-foam",
				children: [
					books.businessName,
					" · ",
					books.mode === "stock" ? "মাল ও বিতরণ" : "সহজ খাতা"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "inline-flex items-center gap-1 rounded-full bg-palm-deep px-3 py-2 text-xs text-paper",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					className: "size-4 shrink-0",
					"aria-hidden": "true"
				}), saved ? "এই ফোনে সেভ আছে" : "ফোনে সেভ হয়নি"]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-label": "আজকের হিসাব",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold text-ink",
					children: "আজকের হিসাব"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "আজ বিক্রি",
							value: formatTaka(revenueBetween(books, start, end))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "আজ পেয়েছি",
							value: formatTaka(collectedBetween(books, start, end))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "মোট পাওনা",
							value: formatTaka(balance(books, "receivable")),
							due: true
						})
					]
				}),
				lighter ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-ink-soft",
					children: [
						"গুদামে ",
						lighter.name,
						" ",
						formatQty(stockAt(books, lighter.id, WAREHOUSE), lighter.packSize, lighter.packName)
					]
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold text-ink",
				children: "কী করতে চান?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid grid-cols-2 gap-2",
				children: actions.map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => open(action.kind),
					className: "flex min-h-32 flex-col items-start justify-between rounded-2xl bg-card p-3 text-left ring-1 ring-line motion-safe:active:scale-95",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-12 place-items-center rounded-full bg-palm-soft text-palm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(action.icon, {
							className: "size-6",
							"aria-hidden": "true"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-lg font-semibold leading-tight text-ink",
						children: action.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-xs text-ink-soft",
						children: action.hint
					})] })]
				}, action.kind))
			}),
			books.mode === "stock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
					onClick: () => push({ id: "visit" }),
					children: "দোকান ভিজিট"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
					onClick: () => open("purchase"),
					children: "মাল এনেছি"
				})]
			}) : null
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl bg-ink p-4 text-paper",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					htmlFor: "utterance",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-semibold",
						children: "বলেই হিসাব লিখুন"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "utterance",
						rows: 2,
						value: utterance,
						onChange: (event) => setUtterance(event.target.value),
						placeholder: "যেমন: রহিম স্টোরে দুই কেস লাইটার বিক্রি করেছি",
						className: "mt-2 min-h-16 w-full resize-none rounded-xl bg-palm-deep px-3 py-3 text-base text-paper outline-none placeholder:text-foam"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							if (!canListen()) {
								setError("এই ফোনে কথা চেনা যায়নি। লিখে দিন — হিসাব একইভাবে হবে।");
								return;
							}
							setListening(true);
							setError("");
							listenBangla().then((text) => {
								setUtterance(text);
								submit(text);
							}).catch(() => setError("কথা পরিষ্কার শোনা যায়নি। লিখে দিন।")).finally(() => setListening(false));
						},
						className: "flex min-h-12 items-center justify-center gap-2 rounded-xl bg-saffron font-display text-base font-semibold text-ink",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {
							className: "size-5",
							"aria-hidden": "true"
						}), listening ? "শুনছি…" : "বলুন"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => submit(utterance),
						className: "min-h-12 rounded-xl bg-paper font-display text-base font-semibold text-ink",
						children: "যাচাই"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2 overflow-x-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sample, {
							label: "২ কেস বিক্রি",
							onClick: () => submit(SAMPLES.sale)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sample, {
							label: "৫০০ আদায়",
							onClick: () => submit(SAMPLES.collect)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sample, {
							label: "১ কেস রাখা",
							onClick: () => submit(SAMPLES.consign)
						})
					]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-saffron-soft",
					children: error
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-lg font-semibold text-ink",
			children: "সাম্প্রতিক"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex flex-col gap-2",
			children: recent.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => push({
					id: "entry",
					entryId: entry.id
				}),
				className: "rounded-2xl bg-card px-4 py-3 text-left ring-1 ring-line",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm text-ink-soft",
					children: formatWhen(entry.at, now)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block text-base text-ink",
					children: entry.summary
				})]
			}, entry.id))
		})] })
	] })] });
}
function Stat({ label, value, due }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-2xl px-2 py-3 ${due ? "bg-clay-soft ring-1 ring-clay" : "bg-card ring-1 ring-line"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-ink-soft",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-base font-semibold leading-tight text-ink tabular-nums",
			children: value
		})]
	});
}
function Sample({ label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "min-h-12 shrink-0 rounded-full bg-palm-deep px-4 text-sm font-semibold text-paper",
		children: label
	});
}
function DuesScreen() {
	const books = useHishab((s) => s.books);
	const open = useOpen();
	const owing = books.parties.filter((party) => party.role === "customer").map((party) => ({
		party,
		due: balance(books, "receivable", party.id)
	})).sort((a, b) => b.due - a.due).filter((row) => row.due > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "bg-palm px-4 pt-5 pb-4 text-paper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-semibold",
			children: "বাকি"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-sm text-foam",
			children: ["মোট পাওনা ", formatTaka(balance(books, "receivable"))]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [owing.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
		title: "পাওনা নেই",
		body: "সব দোকানের বাকি শোধ। নতুন বিক্রি বাকিতে গেলে এখানে আসবে।"
	}) : null, owing.map(({ party, due }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-card p-4 ring-1 ring-line",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg font-semibold text-ink",
				children: party.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-ink",
				children: ["পাওনা ", formatTaka(due)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
					onClick: () => open("collection", { partyId: party.id }),
					children: "টাকা পেয়েছি"
				})
			})
		]
	}, party.id))] })] });
}
function StockScreen() {
	const books = useHishab((s) => s.books);
	const addProduct = useHishab((s) => s.addProduct);
	const open = useOpen();
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [packSize, setPackSize] = (0, import_react.useState)("50");
	const [price, setPrice] = (0, import_react.useState)("");
	const [cost, setCost] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("0");
	const [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "bg-palm px-4 pt-5 pb-4 text-paper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-semibold",
			children: "মাল"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-foam",
			children: "গুদামের মাল আর দোকানে রাখা মাল আলাদা"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		books.products.map((product) => {
			const warehouse = stockAt(books, product.id, WAREHOUSE);
			const held = books.parties.map((party) => ({
				party,
				qty: stockAt(books, product.id, partyLoc(party.id))
			})).filter((row) => row.qty > 0);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-2xl bg-card p-4 ring-1 ring-line",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-semibold text-ink",
						children: product.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-ink-soft",
						children: ["প্রতি পিস ", formatTaka(product.pricePaisa)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-base text-ink",
						children: ["গুদামে ", formatQty(warehouse, product.packSize, product.packName)]
					}),
					held.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 flex flex-col gap-1",
						children: held.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm text-ink",
							children: [
								row.party.name,
								" · রাখা মাল ",
								formatQty(row.qty, product.packSize, product.packName)
							]
						}, row.party.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-ink-soft",
						children: "দোকানে রাখা মাল নেই"
					})
				]
			}, product.id);
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
			onClick: () => open("purchase"),
			children: "মাল এনেছি"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
			onClick: () => setAdding((value) => !value),
			children: adding ? "বন্ধ করুন" : "নতুন মাল"
		}),
		adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-line",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "মালের নাম",
					value: name,
					onChange: setName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "এক কেসে কত পিস",
					value: packSize,
					onChange: setPackSize
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "প্রতি পিস বিক্রি",
					value: price,
					onChange: setPrice
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "প্রতি পিস কেনা দাম",
					value: cost,
					onChange: setCost
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					label: "এখন গুদামে কত পিস",
					value: qty,
					onChange: setQty
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
					tone: "warn",
					title: "হয়নি",
					body: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Primary, {
					onClick: () => {
						const size = Number(packSize);
						const priceTaka = Number(price);
						const costTaka = Number(cost);
						const opening = Number(qty);
						if (!name.trim() || !Number.isInteger(size) || size < 1 || priceTaka <= 0 || costTaka < 0) {
							setError("নাম, কেসে কত পিস, আর বিক্রির দাম দিন।");
							return;
						}
						try {
							addProduct({
								name,
								packName: size > 1 ? "কেস" : "পিস",
								packSize: size,
								priceTaka,
								costTaka,
								qty: Number.isInteger(opening) ? opening : 0
							});
							setAdding(false);
							setName("");
							setError("");
						} catch (err) {
							setError(err instanceof Error ? err.message : "যোগ হয়নি");
						}
					},
					children: "যোগ করুন"
				})
			]
		}) : null
	] })] });
}
function MoreScreen() {
	const books = useHishab((s) => s.books);
	const setMode = useHishab((s) => s.setMode);
	const resetDemo = useHishab((s) => s.resetDemo);
	const push = useHishab((s) => s.push);
	const open = useOpen();
	const [arm, setArm] = (0, import_react.useState)(false);
	const report = audit(books);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "bg-palm px-4 pt-5 pb-4 text-paper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-semibold",
			children: "আরও"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-foam",
			children: books.businessName
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-card p-4 ring-1 ring-line",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-ink-soft",
					children: "নগদ"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl font-semibold text-ink",
					children: formatTaka(balance(books, "cash"))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink",
					children: report.ok ? "প্রতিটি হিসাবের দুই দিক মিলেছে।" : "হিসাবে গরমিল। নতুন হিসাব বন্ধ রাখুন।"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-lg font-semibold text-ink",
			children: "খাতার ধরন"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
			title: "সহজ খাতা",
			detail: "বিক্রি, টাকা, খরচ। মালের তালিকা ছাড়াই।",
			selected: books.mode === "khata",
			onClick: () => setMode("khata")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
			title: "মাল ও বিতরণ",
			detail: "কেস, গুদাম, দোকানে রাখা মাল।",
			selected: books.mode === "stock",
			onClick: () => setMode("stock")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
			onClick: () => open("expense"),
			children: "খরচ করেছি"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
			onClick: () => push({ id: "ledger" }),
			children: "পুরো হিসাব"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secondary, {
			onClick: () => push({ id: "guide" }),
			children: "কীভাবে হিসাব হয়"
		}),
		arm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
			tone: "warn",
			title: "ডেমো আবার শুরু?",
			body: "আপনার নতুন হিসাব মুছে রফিক ট্রেডার্সের আগের খাতা বসবে।"
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => {
				if (!arm) {
					setArm(true);
					return;
				}
				resetDemo();
				setArm(false);
			},
			className: "flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-card font-display text-base font-semibold text-clay ring-1 ring-line",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
				className: "size-4",
				"aria-hidden": "true"
			}), arm ? "হ্যাঁ, ডেমো ফেরান" : "ডেমো আবার শুরু"]
		})
	] })] });
}
function VisitScreen() {
	const books = useHishab((s) => s.books);
	const back = useHishab((s) => s.back);
	const push = useHishab((s) => s.push);
	const customers = books.parties.filter((party) => party.role === "customer");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "দোকান ভিজিট",
		onBack: back
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm leading-relaxed text-ink-soft",
		children: "আগে দোকান, তারপর বিক্রি, আদায়, মাল রাখা বা ফেরত।"
	}), customers.map((party) => {
		const due = balance(books, "receivable", party.id);
		const held = productsAt(books, partyLoc(party.id));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
			title: party.name,
			detail: `${due > 0 ? `পাওনা ${formatTaka(due)}` : "পাওনা নেই"}${held.length ? " · রাখা মাল আছে" : ""}`,
			onClick: () => push({
				id: "shop",
				partyId: party.id
			})
		}, party.id);
	})] })] });
}
function ShopScreen({ partyId }) {
	const books = useHishab((s) => s.books);
	const back = useHishab((s) => s.back);
	const open = useOpen();
	const party = books.parties.find((item) => item.id === partyId);
	if (!party) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "দোকান",
		onBack: back
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
		title: "দোকান নেই",
		body: "তালিকা থেকে আবার বাছুন।"
	}) })] });
	const due = balance(books, "receivable", party.id);
	const held = productsAt(books, partyLoc(party.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: party.name,
		onBack: back
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `rounded-2xl px-4 py-3 ${due > 0 ? "bg-clay-soft ring-1 ring-clay" : "bg-card ring-1 ring-line"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ink-soft",
				children: "পাওনা"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl font-semibold text-ink",
				children: formatTaka(due)
			})]
		}),
		held.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-saffron-soft p-4 ring-1 ring-saffron",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-base font-semibold text-ink",
					children: "দোকানে রাখা মাল"
				}),
				held.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-ink",
					children: [
						row.product.name,
						" · ",
						formatQty(row.qty, row.product.packSize, row.product.packName)
					]
				}, row.product.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink-soft",
					children: "এটা এখনও আপনার মাল। বিক্রি ধরা হয়নি।"
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
			title: "বিক্রি করেছি",
			detail: "গুদাম থেকে মাল কমবে",
			onClick: () => open("sale", { partyId })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
			title: "টাকা পেয়েছি",
			detail: "পুরনো বাকি, নতুন বিক্রি নয়",
			onClick: () => open("collection", { partyId })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
			title: "মাল রেখেছি",
			detail: "বিক্রি নয়",
			onClick: () => open("consign", { partyId })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
			title: "মাল ফেরত",
			detail: "বিক্রি বা রাখা মাল",
			onClick: () => open("return", { partyId })
		}),
		held.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
			title: "রাখা মাল বিক্রি",
			detail: "এখন বিক্রি ধরুন",
			onClick: () => open("sale", {
				partyId,
				fromConsignment: true,
				productId: held.length === 1 ? held[0]?.product.id : void 0
			})
		}) : null
	] })] });
}
function LedgerScreen() {
	const books = useHishab((s) => s.books);
	const back = useHishab((s) => s.back);
	const push = useHishab((s) => s.push);
	const report = audit(books);
	const rows = [...books.entries].reverse();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "পুরো হিসাব",
		onBack: back
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
		title: report.ok ? "হিসাব মিলেছে" : "হিসাবে গরমিল",
		body: report.ok ? "জমা আর খরচের দুই দিক সমান। কোনো হিসাব আধাআধি সেভ হয় না।" : "খাতা বন্ধ করে আবার দেখুন।",
		tone: report.ok ? "info" : "warn"
	}), rows.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => push({
			id: "entry",
			entryId: entry.id
		}),
		className: "rounded-2xl bg-card px-4 py-3 text-left ring-1 ring-line",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-ink-soft",
			children: formatWhen(entry.at)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-1 block text-base text-ink",
			children: entry.summary
		})]
	}, entry.id))] })] });
}
function EntryScreen({ entryId }) {
	const books = useHishab((s) => s.books);
	const back = useHishab((s) => s.back);
	const entry = books.entries.find((item) => item.id === entryId);
	if (!entry) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "হিসাব",
		onBack: back
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
		title: "নেই",
		body: "এই লাইনটা খাতায় নেই।"
	}) })] });
	const view = explain(books, entry);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: view.title,
		onBack: back
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-ink-soft",
			children: formatWhen(entry.at)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-2xl bg-card p-4 ring-1 ring-line",
			children: view.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-baseline justify-between gap-3 py-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-ink-soft",
					children: row.k
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-right font-display text-lg font-semibold text-ink",
					children: row.v
				})]
			}, row.k))
		}),
		view.foot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
			title: "মনে রাখবেন",
			body: view.foot
		}) : null
	] })] });
}
function GuideScreen() {
	const back = useHishab((s) => s.back);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
		title: "কীভাবে হিসাব হয়",
		onBack: back
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [[
		["বোতামই আসল", "কথা বলাটা দ্রুত করার উপায়। মাইক না চললেও বিক্রি, আদায়, মাল রাখা — সব হয়।"],
		["সেভের আগে দেখুন", "কোনো কথা নিজে থেকে টাকা, মাল বা পাওনা বদলায় না। আপনি সেভ চাপলে তবেই।"],
		["রাখা মাল বিক্রি নয়", "দোকানে মাল রেখে এলে সেটা এখনও আপনার। পাওনা বাড়ে না।"],
		["পুরনো বাকি আলাদা", "টাকা পেলে সেটা নতুন বিক্রি নয়। শুধু আগের পাওনা কমে।"],
		["মাল না থাকলে সেভ নয়", "গুদামে যত আছে, তার বেশি বিক্রি হবে না। দুই ফোন একসাথে এক মাল কাটতে পারবে না।"],
		["ফোনে থাকে", "ইন্টারনেট না থাকলেও হিসাব এই ফোনে সেভ হয়। ব্রাউজারের ডাটা মুছলে হিসাব যেতে পারে।"]
	].map(([title, body]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-card p-4 ring-1 ring-line",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-lg font-semibold text-ink",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm leading-relaxed text-ink-soft",
			children: body
		})]
	}, title)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "flex items-start gap-2 text-sm text-ink-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
			className: "mt-0.5 size-4 shrink-0",
			"aria-hidden": "true"
		}), "রফিক ট্রেডার্সের ডেমোতে লাইটার আছে, কেসে ৫০ পিস, প্রতি পিস ১০ টাকা। রহিম স্টোরের বাক্যটা চেপে দেখুন।"]
	})] })] });
}
var TABS = [
	{
		id: "home",
		label: "আজ",
		icon: House
	},
	{
		id: "dues",
		label: "বাকি",
		icon: Wallet
	},
	{
		id: "stock",
		label: "মাল",
		icon: Package
	},
	{
		id: "more",
		label: "আরও",
		icon: Menu
	}
];
function HishabApp() {
	const ready = useHishab((s) => s.ready);
	(0, import_react.useEffect)(() => {
		useHishab.getState().hydrate();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-palm-deep lg:flex lg:h-dvh lg:overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Aside, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-dvh w-full min-w-0 flex-col bg-paper lg:flex-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex h-full w-full max-w-md flex-col",
				children: ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {})
			})
		})]
	});
}
function Splash() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col justify-end bg-palm px-6 pb-16 text-paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "h-1 w-16 rounded-full bg-saffron" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-4xl font-semibold",
				children: "হিসাব সাথী"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-lg text-foam",
				children: "আপনার ব্যবসার হিসাব"
			})
		]
	});
}
function Aside() {
	const ready = useHishab((s) => s.ready);
	const books = useHishab((s) => s.books);
	const start = startOfLocalDay(Date.now());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "hidden w-96 shrink-0 flex-col justify-between overflow-y-auto bg-palm-deep p-10 text-paper lg:flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "h-1 w-16 rounded-full bg-saffron" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 font-display text-4xl font-semibold",
				children: "হিসাব সাথী"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-lg leading-relaxed text-foam",
				children: "দোকানের হিসাব, হিসাবের ভাষায়। কথা বললেই টাকা বদলায় না — দেখে সেভ করলে তবেই।"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-8 flex flex-col gap-4 text-sm leading-relaxed text-foam",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "বিক্রি, আদায়, মাল রাখা, ফেরত — একই জায়গায়।" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "দোকানে রাখা মাল বিক্রি নয়। ওটা এখনও আপনার।" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "ইন্টারনেট না থাকলেও হিসাব এই ফোনে থাকে।" })
				]
			})
		] }), ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 rounded-2xl bg-palm p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-foam",
					children: books.businessName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 flex justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "আজ বিক্রি" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-semibold",
						children: formatTaka(revenueBetween(books, start, start + 864e5))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 flex justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "আজ পেয়েছি" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-semibold",
						children: formatTaka(collectedBetween(books, start, start + 864e5))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 flex justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "মোট পাওনা" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-semibold",
						children: formatTaka(balance(books, "receivable"))
					})]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-foam",
			children: "রফিক ট্রেডার্সের ডেমো খাতা। দুই কেস লাইটার দিয়ে শুরু করুন।"
		})]
	});
}
function Shell() {
	const nav = useHishab((s) => s.nav);
	const toast = useHishab((s) => s.toast);
	const dismissToast = useHishab((s) => s.dismissToast);
	const screen = nav[nav.length - 1] ?? { id: "home" };
	const showTabs = screen.id === "home" || screen.id === "dues" || screen.id === "stock" || screen.id === "more";
	(0, import_react.useEffect)(() => {
		if (!toast) return;
		const timer = window.setTimeout(() => dismissToast(), 2600);
		return () => window.clearTimeout(timer);
	}, [toast, dismissToast]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		"data-screen": screen.id,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: [
					screen.id === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeScreen, {}) : null,
					screen.id === "dues" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DuesScreen, {}) : null,
					screen.id === "stock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockScreen, {}) : null,
					screen.id === "more" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoreScreen, {}) : null,
					screen.id === "visit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitScreen, {}) : null,
					screen.id === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopScreen, { partyId: screen.partyId }) : null,
					screen.id === "ledger" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerScreen, {}) : null,
					screen.id === "guide" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideScreen, {}) : null,
					screen.id === "entry" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntryScreen, { entryId: screen.entryId }) : null,
					screen.id === "flow" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowScreen, {}) : null,
					screen.id === "receipt" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptScreen, { entryId: screen.entryId }) : null
				]
			}),
			toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: dismissToast,
				className: "bg-ink px-4 py-3 text-center text-sm text-paper",
				children: toast
			}) : null,
			showTabs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, { active: screen.id }) : null
		]
	});
}
function Tabs({ active }) {
	const goTab = useHishab((s) => s.goTab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "grid shrink-0 grid-cols-4 border-t border-line bg-card",
		"aria-label": "মূল মেনু",
		children: TABS.map((tab) => {
			const on = tab.id === active;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => goTab(tab.id),
				"aria-current": on ? "page" : void 0,
				className: `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${on ? "text-palm" : "text-ink-soft"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tab.icon, {
					className: "size-5",
					"aria-hidden": "true"
				}), tab.label]
			}, tab.id);
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HishabApp, {});
}
//#endregion
export { Home as component };
