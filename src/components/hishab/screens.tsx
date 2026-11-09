import { useState } from "react";
import {
  Banknote,
  BookOpen,
  CircleCheck,
  Mic,
  PackagePlus,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Store,
  Undo2,
} from "lucide-react";
import { Callout, Choice, Page, Primary, ScreenHeader, Secondary, TextField } from "@/components/hishab/bits";
import { beginDraft } from "@/components/hishab/flows";
import { audit, balance, collectedBetween, explain, productsAt, revenueBetween, stockAt } from "@/lib/hishab/engine";
import { formatQty, formatTaka, formatWhen, startOfLocalDay } from "@/lib/hishab/money";
import { draftFromParse, parseUtterance, SAMPLES } from "@/lib/hishab/parser";
import { firstGap } from "@/lib/hishab/flow";
import { useHishab } from "@/lib/hishab/store";
import { WAREHOUSE, partyLoc, type Draft, type FlowKind } from "@/lib/hishab/types";
import { canListen, listenBangla } from "@/lib/hishab/voice";

function useOpen() {
  const books = useHishab((s) => s.books);
  const openDraft = useHishab((s) => s.openDraft);
  return (kind: FlowKind, extra?: Partial<Draft>) => openDraft(beginDraft(kind, books, extra));
}

export function HomeScreen() {
  const books = useHishab((s) => s.books);
  const saved = useHishab((s) => s.saved);
  const push = useHishab((s) => s.push);
  const openDraft = useHishab((s) => s.openDraft);
  const open = useOpen();
  const now = Date.now();
  const start = startOfLocalDay(now);
  const end = start + 86_400_000;
  const [utterance, setUtterance] = useState("");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  const lighter = books.products.find((product) => product.id === "lighter") ?? books.products[0];
  const recent = books.entries.filter((entry) => entry.kind !== "opening").slice(-4).reverse();
  const actions =
    books.mode === "stock"
      ? [
          { kind: "sale" as const, label: "বিক্রি করেছি", hint: "মাল ও টাকা", icon: ShoppingBag },
          { kind: "collection" as const, label: "টাকা পেয়েছি", hint: "পুরনো বাকি", icon: Banknote },
          { kind: "consign" as const, label: "মাল রেখেছি", hint: "এটা বিক্রি নয়", icon: Store },
          { kind: "return" as const, label: "মাল ফেরত", hint: "মাল ফিরে এল", icon: Undo2 },
        ]
      : [
          { kind: "sale" as const, label: "বিক্রি করেছি", hint: "নগদ বা বাকি", icon: ShoppingBag },
          { kind: "collection" as const, label: "টাকা পেয়েছি", hint: "পুরনো বাকি", icon: Banknote },
          { kind: "purchase" as const, label: "মাল এনেছি", hint: "গুদামে যোগ", icon: PackagePlus },
          { kind: "expense" as const, label: "খরচ করেছি", hint: "ভাড়া, চা, রাস্তা", icon: Receipt },
        ];

  const submit = (text: string) => {
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

  return (
    <div>
      <header className="bg-palm px-4 pt-5 pb-4 text-paper">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold">হিসাব সাথী</h1>
            <p className="mt-1 text-sm text-foam">
              {books.businessName} · {books.mode === "stock" ? "মাল ও বিতরণ" : "সহজ খাতা"}
            </p>
          </div>
          <p className="inline-flex items-center gap-1 rounded-full bg-palm-deep px-3 py-2 text-xs text-paper">
            <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
            {saved ? "এই ফোনে সেভ আছে" : "ফোনে সেভ হয়নি"}
          </p>
        </div>
      </header>
      <Page>
        <section aria-label="আজকের হিসাব">
          <h2 className="font-display text-lg font-semibold text-ink">আজকের হিসাব</h2>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Stat label="আজ বিক্রি" value={formatTaka(revenueBetween(books, start, end))} />
            <Stat label="আজ পেয়েছি" value={formatTaka(collectedBetween(books, start, end))} />
            <Stat label="মোট পাওনা" value={formatTaka(balance(books, "receivable"))} due />
          </div>
          {lighter ? (
            <p className="mt-2 text-sm text-ink-soft">
              গুদামে {lighter.name} {formatQty(stockAt(books, lighter.id, WAREHOUSE), lighter.packSize, lighter.packName)}
            </p>
          ) : null}
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">কী করতে চান?</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {actions.map((action) => (
              <button
                key={action.kind}
                type="button"
                onClick={() => open(action.kind)}
                className="flex min-h-32 flex-col items-start justify-between rounded-2xl bg-card p-3 text-left ring-1 ring-line motion-safe:active:scale-95"
              >
                <span className="grid size-12 place-items-center rounded-full bg-palm-soft text-palm">
                  <action.icon className="size-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-lg font-semibold leading-tight text-ink">{action.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">{action.hint}</span>
                </span>
              </button>
            ))}
          </div>
          {books.mode === "stock" ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Secondary onClick={() => push({ id: "visit" })}>দোকান ভিজিট</Secondary>
              <Secondary onClick={() => open("purchase")}>মাল এনেছি</Secondary>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl bg-ink p-4 text-paper">
          <label className="block" htmlFor="utterance">
            <span className="font-display text-lg font-semibold">বলেই হিসাব লিখুন</span>
            <textarea
              id="utterance"
              rows={2}
              value={utterance}
              onChange={(event) => setUtterance(event.target.value)}
              placeholder="যেমন: রহিম স্টোরে দুই কেস লাইটার বিক্রি করেছি"
              className="mt-2 min-h-16 w-full resize-none rounded-xl bg-palm-deep px-3 py-3 text-base text-paper outline-none placeholder:text-foam"
            />
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (!canListen()) {
                  setError("এই ফোনে কথা চেনা যায়নি। লিখে দিন — হিসাব একইভাবে হবে।");
                  return;
                }
                setListening(true);
                setError("");
                listenBangla()
                  .then((text) => {
                    setUtterance(text);
                    submit(text);
                  })
                  .catch(() => setError("কথা পরিষ্কার শোনা যায়নি। লিখে দিন।"))
                  .finally(() => setListening(false));
              }}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-saffron font-display text-base font-semibold text-ink"
            >
              <Mic className="size-5" aria-hidden="true" />
              {listening ? "শুনছি…" : "বলুন"}
            </button>
            <button
              type="button"
              onClick={() => submit(utterance)}
              className="min-h-12 rounded-xl bg-paper font-display text-base font-semibold text-ink"
            >
              যাচাই
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            <Sample label="২ কেস বিক্রি" onClick={() => submit(SAMPLES.sale)} />
            <Sample label="৫০০ আদায়" onClick={() => submit(SAMPLES.collect)} />
            <Sample label="১ কেস রাখা" onClick={() => submit(SAMPLES.consign)} />
          </div>
          {error ? <p className="mt-3 text-sm text-saffron-soft">{error}</p> : null}
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">সাম্প্রতিক</h2>
          <div className="mt-2 flex flex-col gap-2">
            {recent.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => push({ id: "entry", entryId: entry.id })}
                className="rounded-2xl bg-card px-4 py-3 text-left ring-1 ring-line"
              >
                <span className="block text-sm text-ink-soft">{formatWhen(entry.at, now)}</span>
                <span className="mt-1 block text-base text-ink">{entry.summary}</span>
              </button>
            ))}
          </div>
        </section>
      </Page>
    </div>
  );
}

function Stat({ label, value, due }: { label: string; value: string; due?: boolean }) {
  return (
    <div className={`rounded-2xl px-2 py-3 ${due ? "bg-clay-soft ring-1 ring-clay" : "bg-card ring-1 ring-line"}`}>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-base font-semibold leading-tight text-ink tabular-nums">{value}</p>
    </div>
  );
}

function Sample({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-12 shrink-0 rounded-full bg-palm-deep px-4 text-sm font-semibold text-paper">
      {label}
    </button>
  );
}

export function DuesScreen() {
  const books = useHishab((s) => s.books);
  const open = useOpen();
  const rows = books.parties
    .filter((party) => party.role === "customer")
    .map((party) => ({ party, due: balance(books, "receivable", party.id) }))
    .sort((a, b) => b.due - a.due);
  const owing = rows.filter((row) => row.due > 0);

  return (
    <div>
      <header className="bg-palm px-4 pt-5 pb-4 text-paper">
        <h1 className="font-display text-3xl font-semibold">বাকি</h1>
        <p className="mt-1 text-sm text-foam">মোট পাওনা {formatTaka(balance(books, "receivable"))}</p>
      </header>
      <Page>
        {owing.length === 0 ? <Callout title="পাওনা নেই" body="সব দোকানের বাকি শোধ। নতুন বিক্রি বাকিতে গেলে এখানে আসবে।" /> : null}
        {owing.map(({ party, due }) => (
          <div key={party.id} className="rounded-2xl bg-card p-4 ring-1 ring-line">
            <p className="font-display text-lg font-semibold text-ink">{party.name}</p>
            <p className="mt-1 text-sm text-ink">পাওনা {formatTaka(due)}</p>
            <div className="mt-3">
              <Primary onClick={() => open("collection", { partyId: party.id })}>টাকা পেয়েছি</Primary>
            </div>
          </div>
        ))}
      </Page>
    </div>
  );
}

export function StockScreen() {
  const books = useHishab((s) => s.books);
  const addProduct = useHishab((s) => s.addProduct);
  const open = useOpen();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [packSize, setPackSize] = useState("50");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [qty, setQty] = useState("0");
  const [error, setError] = useState("");

  return (
    <div>
      <header className="bg-palm px-4 pt-5 pb-4 text-paper">
        <h1 className="font-display text-3xl font-semibold">মাল</h1>
        <p className="mt-1 text-sm text-foam">গুদামের মাল আর দোকানে রাখা মাল আলাদা</p>
      </header>
      <Page>
        {books.products.map((product) => {
          const warehouse = stockAt(books, product.id, WAREHOUSE);
          const held = books.parties
            .map((party) => ({ party, qty: stockAt(books, product.id, partyLoc(party.id)) }))
            .filter((row) => row.qty > 0);
          return (
            <article key={product.id} className="rounded-2xl bg-card p-4 ring-1 ring-line">
              <h2 className="font-display text-xl font-semibold text-ink">{product.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">প্রতি পিস {formatTaka(product.pricePaisa)}</p>
              <p className="mt-3 text-base text-ink">
                গুদামে {formatQty(warehouse, product.packSize, product.packName)}
              </p>
              {held.length ? (
                <ul className="mt-2 flex flex-col gap-1">
                  {held.map((row) => (
                    <li key={row.party.id} className="text-sm text-ink">
                      {row.party.name} · রাখা মাল {formatQty(row.qty, product.packSize, product.packName)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-soft">দোকানে রাখা মাল নেই</p>
              )}
            </article>
          );
        })}
        <Secondary onClick={() => open("purchase")}>মাল এনেছি</Secondary>
        <Secondary onClick={() => setAdding((value) => !value)}>{adding ? "বন্ধ করুন" : "নতুন মাল"}</Secondary>
        {adding ? (
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-line">
            <TextField label="মালের নাম" value={name} onChange={setName} />
            <TextField label="এক কেসে কত পিস" value={packSize} onChange={setPackSize} />
            <TextField label="প্রতি পিস বিক্রি" value={price} onChange={setPrice} />
            <TextField label="প্রতি পিস কেনা দাম" value={cost} onChange={setCost} />
            <TextField label="এখন গুদামে কত পিস" value={qty} onChange={setQty} />
            {error ? <Callout tone="warn" title="হয়নি" body={error} /> : null}
            <Primary
              onClick={() => {
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
                    qty: Number.isInteger(opening) ? opening : 0,
                  });
                  setAdding(false);
                  setName("");
                  setError("");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "যোগ হয়নি");
                }
              }}
            >
              যোগ করুন
            </Primary>
          </div>
        ) : null}
      </Page>
    </div>
  );
}

export function MoreScreen() {
  const books = useHishab((s) => s.books);
  const setMode = useHishab((s) => s.setMode);
  const resetDemo = useHishab((s) => s.resetDemo);
  const push = useHishab((s) => s.push);
  const open = useOpen();
  const [arm, setArm] = useState(false);
  const report = audit(books);

  return (
    <div>
      <header className="bg-palm px-4 pt-5 pb-4 text-paper">
        <h1 className="font-display text-3xl font-semibold">আরও</h1>
        <p className="mt-1 text-sm text-foam">{books.businessName}</p>
      </header>
      <Page>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
          <p className="text-sm text-ink-soft">নগদ</p>
          <p className="font-display text-3xl font-semibold text-ink">{formatTaka(balance(books, "cash"))}</p>
          <p className="mt-2 text-sm text-ink">{report.ok ? "প্রতিটি হিসাবের দুই দিক মিলেছে।" : "হিসাবে গরমিল। নতুন হিসাব বন্ধ রাখুন।"}</p>
        </div>
        <h2 className="font-display text-lg font-semibold text-ink">খাতার ধরন</h2>
        <Choice
          title="সহজ খাতা"
          detail="বিক্রি, টাকা, খরচ। মালের তালিকা ছাড়াই।"
          selected={books.mode === "khata"}
          onClick={() => setMode("khata")}
        />
        <Choice
          title="মাল ও বিতরণ"
          detail="কেস, গুদাম, দোকানে রাখা মাল।"
          selected={books.mode === "stock"}
          onClick={() => setMode("stock")}
        />
        <Secondary onClick={() => open("expense")}>খরচ করেছি</Secondary>
        <Secondary onClick={() => push({ id: "ledger" })}>পুরো হিসাব</Secondary>
        <Secondary onClick={() => push({ id: "guide" })}>কীভাবে হিসাব হয়</Secondary>
        {arm ? (
          <Callout tone="warn" title="ডেমো আবার শুরু?" body="আপনার নতুন হিসাব মুছে রফিক ট্রেডার্সের আগের খাতা বসবে।" />
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (!arm) {
              setArm(true);
              return;
            }
            resetDemo();
            setArm(false);
          }}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-card font-display text-base font-semibold text-clay ring-1 ring-line"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {arm ? "হ্যাঁ, ডেমো ফেরান" : "ডেমো আবার শুরু"}
        </button>
      </Page>
    </div>
  );
}

export function VisitScreen() {
  const books = useHishab((s) => s.books);
  const back = useHishab((s) => s.back);
  const push = useHishab((s) => s.push);
  const customers = books.parties.filter((party) => party.role === "customer");
  return (
    <div>
      <ScreenHeader title="দোকান ভিজিট" onBack={back} />
      <Page>
        <p className="text-sm leading-relaxed text-ink-soft">আগে দোকান, তারপর বিক্রি, আদায়, মাল রাখা বা ফেরত।</p>
        {customers.map((party) => {
          const due = balance(books, "receivable", party.id);
          const held = productsAt(books, partyLoc(party.id));
          return (
            <Choice
              key={party.id}
              title={party.name}
              detail={`${due > 0 ? `পাওনা ${formatTaka(due)}` : "পাওনা নেই"}${held.length ? " · রাখা মাল আছে" : ""}`}
              onClick={() => push({ id: "shop", partyId: party.id })}
            />
          );
        })}
      </Page>
    </div>
  );
}

export function ShopScreen({ partyId }: { partyId: string }) {
  const books = useHishab((s) => s.books);
  const back = useHishab((s) => s.back);
  const open = useOpen();
  const party = books.parties.find((item) => item.id === partyId);
  if (!party) {
    return (
      <div>
        <ScreenHeader title="দোকান" onBack={back} />
        <Page>
          <Callout title="দোকান নেই" body="তালিকা থেকে আবার বাছুন।" />
        </Page>
      </div>
    );
  }
  const due = balance(books, "receivable", party.id);
  const held = productsAt(books, partyLoc(party.id));
  return (
    <div>
      <ScreenHeader title={party.name} onBack={back} />
      <Page>
        <div className={`rounded-2xl px-4 py-3 ${due > 0 ? "bg-clay-soft ring-1 ring-clay" : "bg-card ring-1 ring-line"}`}>
          <p className="text-sm text-ink-soft">পাওনা</p>
          <p className="font-display text-3xl font-semibold text-ink">{formatTaka(due)}</p>
        </div>
        {held.length ? (
          <div className="rounded-2xl bg-saffron-soft p-4 ring-1 ring-saffron">
            <p className="font-display text-base font-semibold text-ink">দোকানে রাখা মাল</p>
            {held.map((row) => (
              <p key={row.product.id} className="mt-1 text-sm text-ink">
                {row.product.name} · {formatQty(row.qty, row.product.packSize, row.product.packName)}
              </p>
            ))}
            <p className="mt-2 text-sm text-ink-soft">এটা এখনও আপনার মাল। বিক্রি ধরা হয়নি।</p>
          </div>
        ) : null}
        <Choice title="বিক্রি করেছি" detail="গুদাম থেকে মাল কমবে" onClick={() => open("sale", { partyId })} />
        <Choice title="টাকা পেয়েছি" detail="পুরনো বাকি, নতুন বিক্রি নয়" onClick={() => open("collection", { partyId })} />
        <Choice title="মাল রেখেছি" detail="বিক্রি নয়" onClick={() => open("consign", { partyId })} />
        <Choice title="মাল ফেরত" detail="বিক্রি বা রাখা মাল" onClick={() => open("return", { partyId })} />
        {held.length ? (
          <Choice
            title="রাখা মাল বিক্রি"
            detail="এখন বিক্রি ধরুন"
            onClick={() =>
              open("sale", {
                partyId,
                fromConsignment: true,
                productId: held.length === 1 ? held[0]?.product.id : undefined,
              })
            }
          />
        ) : null}
      </Page>
    </div>
  );
}

export function LedgerScreen() {
  const books = useHishab((s) => s.books);
  const back = useHishab((s) => s.back);
  const push = useHishab((s) => s.push);
  const report = audit(books);
  const rows = [...books.entries].reverse();
  return (
    <div>
      <ScreenHeader title="পুরো হিসাব" onBack={back} />
      <Page>
        <Callout
          title={report.ok ? "হিসাব মিলেছে" : "হিসাবে গরমিল"}
          body={report.ok ? "জমা আর খরচের দুই দিক সমান। কোনো হিসাব আধাআধি সেভ হয় না।" : "খাতা বন্ধ করে আবার দেখুন।"}
          tone={report.ok ? "info" : "warn"}
        />
        {rows.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => push({ id: "entry", entryId: entry.id })}
            className="rounded-2xl bg-card px-4 py-3 text-left ring-1 ring-line"
          >
            <span className="text-sm text-ink-soft">{formatWhen(entry.at)}</span>
            <span className="mt-1 block text-base text-ink">{entry.summary}</span>
          </button>
        ))}
      </Page>
    </div>
  );
}

export function EntryScreen({ entryId }: { entryId: string }) {
  const books = useHishab((s) => s.books);
  const back = useHishab((s) => s.back);
  const entry = books.entries.find((item) => item.id === entryId);
  if (!entry) {
    return (
      <div>
        <ScreenHeader title="হিসাব" onBack={back} />
        <Page>
          <Callout title="নেই" body="এই লাইনটা খাতায় নেই।" />
        </Page>
      </div>
    );
  }
  const view = explain(books, entry);
  return (
    <div>
      <ScreenHeader title={view.title} onBack={back} />
      <Page>
        <p className="text-sm text-ink-soft">{formatWhen(entry.at)}</p>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
          {view.rows.map((row) => (
            <p key={row.k} className="flex items-baseline justify-between gap-3 py-1">
              <span className="text-sm text-ink-soft">{row.k}</span>
              <span className="text-right font-display text-lg font-semibold text-ink">{row.v}</span>
            </p>
          ))}
        </div>
        {view.foot ? <Callout title="মনে রাখবেন" body={view.foot} /> : null}
      </Page>
    </div>
  );
}

export function GuideScreen() {
  const back = useHishab((s) => s.back);
  const rules = [
    ["বোতামই আসল", "কথা বলাটা দ্রুত করার উপায়। মাইক না চললেও বিক্রি, আদায়, মাল রাখা — সব হয়।"],
    ["সেভের আগে দেখুন", "কোনো কথা নিজে থেকে টাকা, মাল বা পাওনা বদলায় না। আপনি সেভ চাপলে তবেই।"],
    ["রাখা মাল বিক্রি নয়", "দোকানে মাল রেখে এলে সেটা এখনও আপনার। পাওনা বাড়ে না।"],
    ["পুরনো বাকি আলাদা", "টাকা পেলে সেটা নতুন বিক্রি নয়। শুধু আগের পাওনা কমে।"],
    ["মাল না থাকলে সেভ নয়", "গুদামে যত আছে, তার বেশি বিক্রি হবে না। দুই ফোন একসাথে এক মাল কাটতে পারবে না।"],
    ["ফোনে থাকে", "ইন্টারনেট না থাকলেও হিসাব এই ফোনে সেভ হয়। ব্রাউজারের ডাটা মুছলে হিসাব যেতে পারে।"],
  ];
  return (
    <div>
      <ScreenHeader title="কীভাবে হিসাব হয়" onBack={back} />
      <Page>
        {rules.map(([title, body]) => (
          <div key={title} className="rounded-2xl bg-card p-4 ring-1 ring-line">
            <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
        <p className="flex items-start gap-2 text-sm text-ink-soft">
          <BookOpen className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          রফিক ট্রেডার্সের ডেমোতে লাইটার আছে, কেসে ৫০ পিস, প্রতি পিস ১০ টাকা। রহিম স্টোরের বাক্যটা চেপে দেখুন।
        </p>
      </Page>
    </div>
  );
}
