import { useRef, useState } from "react";
import { Check, Volume2 } from "lucide-react";
import { Callout, Choice, Field, NumPad, Page, popDigit, Primary, pushDigit, ScreenHeader, Secondary, TextField } from "@/components/hishab/bits";
import { balance, explain, productById, productsAt, stockAt } from "@/lib/hishab/engine";
import { entryFromDraft, firstGap, blankDraft, piecesOf, previewDraft, stepsFor } from "@/lib/hishab/flow";
import { formatQty, formatTaka, toBn, toBnGrouped } from "@/lib/hishab/money";
import { useHishab } from "@/lib/hishab/store";
import { WAREHOUSE, partyLoc, type Books, type Draft, type FlowStep, type Party, type Product } from "@/lib/hishab/types";
import { speakBangla } from "@/lib/hishab/voice";

const REASONS = ["বিক্রি হয়নি", "মাল ভাঙা", "ভুল করে দিয়েছি", "অন্যান্য"];
const EXPENSES = ["ভাড়া", "পরিবহন", "চা-নাস্তা", "বিদ্যুৎ", "অন্যান্য"];

export function FlowScreen() {
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
  const jump = (step: FlowStep) => patchDraft({ step });

  return (
    <div data-flow={draft.kind}>
      <ScreenHeader title={titleOf(draft)} onBack={back} />
      <p className="px-4 pb-2 text-sm text-ink-soft">
        ধাপ {toBn(Math.min(index + 1, steps.length))} / {toBn(steps.length)}
      </p>
      {draft.step === "party" ? <PartyStep onNext={jump} /> : null}
      {draft.step === "product" ? <ProductStep onNext={jump} /> : null}
      {draft.step === "money" ? <MoneyStep onNext={jump} /> : null}
      {draft.step === "reason" ? <ReasonStep onNext={jump} /> : null}
      {draft.step === "confirm" ? <ConfirmStep onEdit={jump} /> : null}
    </div>
  );
}

function titleOf(draft: Draft): string {
  if (draft.kind === "sale" && draft.fromConsignment) return "রাখা মাল বিক্রি";
  if (draft.kind === "sale") return "বিক্রি করেছি";
  if (draft.kind === "collection") return "টাকা পেয়েছি";
  if (draft.kind === "consign") return "মাল রেখেছি";
  if (draft.kind === "return") return "মাল ফেরত";
  if (draft.kind === "purchase") return "মাল এনেছি";
  return "খরচ করেছি";
}

function PartyStep({ onNext }: { onNext: (step: FlowStep) => void }) {
  const books = useHishab((s) => s.books);
  const draft = useHishab((s) => s.draft)!;
  const patchDraft = useHishab((s) => s.patchDraft);
  const addParty = useHishab((s) => s.addParty);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const role = draft.kind === "purchase" ? "supplier" : "customer";
  const parties = books.parties
    .filter((party) => (role === "supplier" ? true : party.role === "customer"))
    .filter((party) => party.name.includes(query.trim()))
    .sort((a, b) => balance(books, "receivable", b.id) - balance(books, "receivable", a.id));

  const choose = (party: Party) => {
    patchDraft({ partyId: party.id, partySkipped: false });
    onNext(nextAfter("party", draft, books.mode));
  };

  return (
    <Page>
      <TextField label={role === "supplier" ? "কার কাছ থেকে" : "কোন দোকান"} value={query} onChange={setQuery} placeholder="নাম লিখে খুঁজুন" />
      {error ? <Callout tone="warn" title="হয়নি" body={error} /> : null}
      <div className="flex flex-col gap-2">
        {parties.map((party) => (
          <Choice
            key={party.id}
            title={party.name}
            selected={draft.partyId === party.id}
            detail={partyDetail(books, party, draft.kind)}
            onClick={() => choose(party)}
          />
        ))}
      </div>
      {query.trim() ? (
        <Secondary
          onClick={() => {
            try {
              const id = addParty(query, role === "supplier" ? "supplier" : "customer");
              patchDraft({ partyId: id, partySkipped: false });
              onNext(nextAfter("party", draft, books.mode));
            } catch (err) {
              setError(err instanceof Error ? err.message : "যোগ হয়নি");
            }
          }}
        >
          “{query.trim()}” নতুন যোগ করুন
        </Secondary>
      ) : null}
      {draft.kind === "purchase" ? (
        <Secondary
          onClick={() => {
            patchDraft({ partyId: undefined, partySkipped: true });
            onNext(nextAfter("party", draft, books.mode));
          }}
        >
          কারো নাম নেই, নগদ কিনেছি
        </Secondary>
      ) : null}
      {draft.kind === "sale" && !draft.productId && books.mode === "khata" ? (
        <Secondary
          onClick={() => {
            patchDraft({ partyId: undefined, partySkipped: true });
            onNext("money");
          }}
        >
          দোকান নেই — নগদ বিক্রি
        </Secondary>
      ) : null}
    </Page>
  );
}

function partyDetail(books: ReturnType<typeof useHishab.getState>["books"], party: Party, kind: Draft["kind"]): string {
  const due = balance(books, "receivable", party.id);
  const held = productsAt(books, partyLoc(party.id));
  const bits = [due > 0 ? `পাওনা ${formatTaka(due)}` : "পাওনা নেই"];
  if (held.length) bits.push("রাখা মাল আছে");
  if (kind === "purchase" && party.role === "supplier") bits.push("সরবরাহকারী");
  return bits.join(" · ");
}

function ProductStep({ onNext }: { onNext: (step: FlowStep) => void }) {
  const books = useHishab((s) => s.books);
  const draft = useHishab((s) => s.draft)!;
  const patchDraft = useHishab((s) => s.patchDraft);
  const product = productById(books, draft.productId);
  const [error, setError] = useState("");

  const pick = (item: Product) => {
    patchDraft({
      productId: item.id,
      unitPriceTaka: Math.round(item.pricePaisa / 100),
      costTaka: Math.round(item.costPaisa / 100),
      unit: item.packSize > 1 ? "pack" : "pcs",
    });
  };

  return (
    <Page>
      <div className="flex flex-col gap-2">
        {books.products.map((item) => {
          const where =
            draft.fromConsignment && draft.partyId
              ? stockAt(books, item.id, partyLoc(draft.partyId))
              : stockAt(books, item.id, WAREHOUSE);
          return (
            <Choice
              key={item.id}
              title={item.name}
              selected={draft.productId === item.id}
              detail={`${draft.fromConsignment ? "রাখা আছে" : "গুদামে"} ${formatQty(where, item.packSize, item.packName)} · প্রতি পিস ${formatTaka(item.pricePaisa)}`}
              onClick={() => pick(item)}
            />
          );
        })}
      </div>
      {product ? (
        <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
          {product.packSize > 1 ? (
            <div className="grid grid-cols-2 gap-2">
              <UnitButton active={draft.unit === "pack"} onClick={() => patchDraft({ unit: "pack" })} label={product.packName} />
              <UnitButton active={draft.unit === "pcs"} onClick={() => patchDraft({ unit: "pcs" })} label="পিস" />
            </div>
          ) : null}
          <div className="mt-4 flex items-center justify-between">
            <button type="button" aria-label="কমান" onClick={() => patchDraft({ qtyInput: Math.max(0, draft.qtyInput - 1) })} className="grid size-14 place-items-center rounded-full bg-paper-deep font-display text-2xl text-ink">
              −
            </button>
            <p className="font-display text-4xl font-semibold text-ink tabular-nums">{toBn(draft.qtyInput)}</p>
            <button type="button" aria-label="বাড়ান" onClick={() => patchDraft({ qtyInput: draft.qtyInput + 1 })} className="grid size-14 place-items-center rounded-full bg-palm font-display text-2xl text-paper">
              +
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[1, 2, 5].map((n) => (
              <button key={n} type="button" onClick={() => patchDraft({ qtyInput: n })} className="min-h-12 rounded-xl bg-paper-deep font-display text-base font-semibold text-ink">
                {toBn(n)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-ink-soft">
            {draft.unit === "pack"
              ? `${toBn(draft.qtyInput)} ${product.packName} = ${toBnGrouped(piecesOf({ ...draft, productId: product.id }, product.packSize))} পিস`
              : `${toBnGrouped(draft.qtyInput)} পিস`}
          </p>
        </div>
      ) : null}
      {error ? <Callout tone="warn" title="হয়নি" body={error} /> : null}
      <Primary
        onClick={() => {
          if (!draft.productId || draft.qtyInput <= 0) {
            setError("মাল আর কয়টা, দুটোই বাছুন।");
            return;
          }
          if (draft.kind === "purchase" && product) {
            patchDraft({ paidTaka: piecesOf(draft, product.packSize) * draft.costTaka });
          }
          onNext(nextAfter("product", draft, books.mode));
        }}
      >
        পরের ধাপ
      </Primary>
    </Page>
  );
}

function UnitButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-xl font-display text-base font-semibold ${active ? "bg-palm text-paper" : "bg-paper-deep text-ink"}`}
    >
      {label}
    </button>
  );
}

function MoneyStep({ onNext }: { onNext: (step: FlowStep) => void }) {
  const books = useHishab((s) => s.books);
  const draft = useHishab((s) => s.draft)!;
  const patchDraft = useHishab((s) => s.patchDraft);
  const product = productById(books, draft.productId);
  const pieces = piecesOf(draft, product?.packSize ?? 1);
  const stockSale = Boolean(draft.productId) || books.mode === "stock";
  const saleTotal = stockSale && draft.kind === "sale" ? pieces * draft.unitPriceTaka : draft.amountTaka;
  const dueParty = draft.partyId ? Math.round(balance(books, "receivable", draft.partyId) / 100) : 0;
  const purchaseTotal = pieces * draft.costTaka;
  const [field, setField] = useState<"price" | "got" | "amount" | "cost" | "paid">(
    draft.kind === "purchase" ? "paid" : draft.kind === "sale" && stockSale ? "got" : "amount",
  );
  const [error, setError] = useState("");

  const current =
    field === "price"
      ? draft.unitPriceTaka
      : field === "got"
        ? draft.receivedTaka
        : field === "cost"
          ? draft.costTaka
          : field === "paid"
            ? draft.paidTaka
            : draft.amountTaka;

  const write = (value: number) => {
    if (field === "price") patchDraft({ unitPriceTaka: value });
    else if (field === "got") patchDraft({ receivedTaka: value, receivedKnown: true });
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

  return (
    <Page>
      {draft.kind === "collection" ? (
        <div className="rounded-2xl bg-clay-soft px-4 py-3 ring-1 ring-clay">
          <p className="text-sm text-ink">এই দোকানের পাওনা</p>
          <p className="font-display text-3xl font-semibold text-ink tabular-nums">{formatTaka(dueParty * 100)}</p>
        </div>
      ) : null}
      {draft.kind === "expense" ? (
        <div className="flex flex-wrap gap-2">
          {EXPENSES.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => patchDraft({ expenseLabel: label })}
              className={`min-h-12 rounded-full px-4 font-display text-base font-semibold ${
                draft.expenseLabel === label ? "bg-palm text-paper" : "bg-card text-ink ring-1 ring-line"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      {draft.kind === "sale" && stockSale ? (
        <>
          <Field label="প্রতি পিস দাম" value={draft.unitPriceTaka} active={field === "price"} onClick={() => setField("price")} />
          <Field label="মোট বিক্রি" value={saleTotal} />
          <Field label="টাকা পেয়েছি" value={draft.receivedTaka} active={field === "got"} onClick={() => setField("got")} />
          <Field label="বাকি থাকবে" value={Math.max(saleTotal - draft.receivedTaka, 0)} />
          <div className="grid grid-cols-3 gap-2">
            <Chip label="সব পেয়েছি" onClick={() => { setField("got"); patchDraft({ receivedTaka: saleTotal, receivedKnown: true }); }} />
            <Chip label="কিছুই না" onClick={() => { setField("got"); patchDraft({ receivedTaka: 0, receivedKnown: true }); }} />
            <Chip label="অর্ধেক" onClick={() => { setField("got"); patchDraft({ receivedTaka: Math.round(saleTotal / 2), receivedKnown: true }); }} />
          </div>
        </>
      ) : null}
      {draft.kind === "sale" && !stockSale ? (
        <>
          <Field label="মোট বিক্রি" value={draft.amountTaka} active={field === "amount"} onClick={() => setField("amount")} />
          <Field label="টাকা পেয়েছি" value={draft.receivedTaka} active={field === "got"} onClick={() => setField("got")} />
          <Field label="বাকি থাকবে" value={Math.max(draft.amountTaka - draft.receivedTaka, 0)} />
        </>
      ) : null}
      {draft.kind === "collection" ? (
        <>
          <Field label="এখন পেয়েছি" value={draft.amountTaka} active />
          <Chip label="পুরো পাওনা" onClick={() => patchDraft({ amountTaka: dueParty })} />
        </>
      ) : null}
      {draft.kind === "purchase" ? (
        <>
          <Field label="প্রতি পিস কেনা দাম" value={draft.costTaka} active={field === "cost"} onClick={() => setField("cost")} />
          <Field label="মোট কেনা" value={purchaseTotal} />
          <Field label="এখন দিয়েছি" value={draft.paidTaka} active={field === "paid"} onClick={() => setField("paid")} />
          <Field label="পরে দেব" value={Math.max(purchaseTotal - draft.paidTaka, 0)} />
          <div className="grid grid-cols-2 gap-2">
            <Chip label="সব দিয়েছি" onClick={() => { setField("paid"); patchDraft({ paidTaka: purchaseTotal }); }} />
            <Chip label="পরে দেব" onClick={() => { setField("paid"); patchDraft({ paidTaka: 0 }); }} />
          </div>
        </>
      ) : null}
      {draft.kind === "expense" ? <Field label="খরচের টাকা" value={draft.amountTaka} active /> : null}
      <NumPad onDigit={(n) => write(pushDigit(current, n))} onBack={() => write(popDigit(current))} onClear={() => write(0)} />
      {error ? <Callout tone="warn" title="ঠিক করুন" body={error} /> : null}
      <Primary onClick={finish}>হিসাব দেখুন</Primary>
    </Page>
  );
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-12 rounded-xl bg-paper-deep px-2 font-display text-sm font-semibold text-ink">
      {label}
    </button>
  );
}

function ReasonStep({ onNext }: { onNext: (step: FlowStep) => void }) {
  const draft = useHishab((s) => s.draft)!;
  const patchDraft = useHishab((s) => s.patchDraft);
  return (
    <Page>
      <div className="grid grid-cols-1 gap-2">
        <Choice
          title="বিক্রি করা মাল ফেরত"
          detail="বিক্রি কমবে, পাওনা বা নগদ কমবে"
          selected={draft.reasonKnown && draft.returnMode === "sold"}
          onClick={() => patchDraft({ returnMode: "sold", reasonKnown: true })}
        />
        <Choice
          title="রাখা মাল ফিরিয়ে এনেছি"
          detail="বিক্রি নয়। মাল আবার গুদামে"
          selected={draft.reasonKnown && draft.returnMode === "consign"}
          onClick={() => patchDraft({ returnMode: "consign", reasonKnown: true })}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            onClick={() => patchDraft({ expenseLabel: reason })}
            className={`min-h-12 rounded-full px-4 text-sm font-semibold ${
              draft.expenseLabel === reason ? "bg-ink text-paper" : "bg-card text-ink ring-1 ring-line"
            }`}
          >
            {reason}
          </button>
        ))}
      </div>
      <Primary
        disabled={!draft.reasonKnown}
        onClick={() => onNext("confirm")}
      >
        হিসাব দেখুন
      </Primary>
    </Page>
  );
}

function ConfirmStep({ onEdit }: { onEdit: (step: FlowStep) => void }) {
  const books = useHishab((s) => s.books);
  const draft = useHishab((s) => s.draft)!;
  const commitEntry = useHishab((s) => s.commitEntry);
  const idRef = useRef(crypto.randomUUID());
  const [saving, setSaving] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const [error, setError] = useState("");
  const view = previewDraft(books, draft);

  const edit = () => {
    const steps = stepsFor(draft, books.mode);
    const target = [...steps].reverse().find((step) => step !== "confirm") ?? "party";
    onEdit(target);
  };

  return (
    <Page>
      {draft.notes.map((note) => (
        <Callout key={note} title="মিলিয়ে নিন" body={note} />
      ))}
      {view.ok ? (
        <>
          {view.banner ? <Callout title={view.banner.title} body={view.banner.body} tone={view.banner.title.includes("নয়") ? "warn" : "info"} /> : null}
          <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
            <h2 className="font-display text-2xl font-semibold text-ink">{view.title}</h2>
            <dl className="mt-3 flex flex-col gap-2">
              {view.rows.map((row) => (
                <div key={row.k} className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm text-ink-soft">{row.k}</dt>
                  <dd className="text-right font-display text-lg font-semibold text-ink">{row.v}</dd>
                </div>
              ))}
            </dl>
            {view.foot ? <p className="mt-3 text-sm leading-relaxed text-ink-soft">{view.foot}</p> : null}
          </div>
          {view.after.length ? (
            <div className="rounded-2xl bg-palm-soft p-4">
              {view.after.map((row) => (
                <p key={row.k} className="flex items-baseline justify-between gap-3 py-1 text-ink">
                  <span className="text-sm">{row.k}</span>
                  <span className="font-display text-lg font-semibold">{row.v}</span>
                </p>
              ))}
            </div>
          ) : null}
          <div className="rounded-2xl bg-ink px-4 py-4 text-paper">
            <p className="text-sm text-foam">শুনে যাচাই করুন</p>
            <p className="mt-2 font-display text-lg leading-relaxed">{view.readback}</p>
            <button
              type="button"
              onClick={() => setSpoken(speakBangla(view.readback))}
              className="mt-3 flex min-h-12 items-center gap-2 rounded-full bg-saffron px-4 font-display text-base font-semibold text-ink"
            >
              <Volume2 className="size-5" aria-hidden="true" />
              {spoken ? "আবার শুনুন" : "শুনুন"}
            </button>
          </div>
        </>
      ) : (
        <Callout tone="warn" title="সেভ হবে না" body={view.error} />
      )}
      {error ? <Callout tone="warn" title="সেভ হয়নি" body={error} /> : null}
      <div className="grid grid-cols-2 gap-2">
        <Secondary onClick={edit}>ঠিক করুন</Secondary>
        <button
          type="button"
          disabled={!view.ok || saving}
          onClick={() => {
            if (!view.ok || saving) return;
            setSaving(true);
            try {
              commitEntry(entryFromDraft(books, draft, idRef.current));
            } catch (err) {
              setSaving(false);
              setError(err instanceof Error ? err.message : "সেভ হয়নি");
            }
          }}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-palm px-3 font-display text-base font-semibold text-paper disabled:opacity-40"
        >
          <Check className="size-5" aria-hidden="true" />
          সেভ করুন
        </button>
      </div>
      <p className="text-center text-sm text-ink-soft">কথা নিজে থেকে টাকা বদলায় না। সেভ আপনি চাপলেই।</p>
    </Page>
  );
}

function nextAfter(step: FlowStep, draft: Draft, mode: Books["mode"]): FlowStep {
  const steps = stepsFor(draft, mode);
  const index = steps.indexOf(step);
  return steps[index + 1] ?? "confirm";
}

export function ReceiptScreen({ entryId }: { entryId: string }) {
  const books = useHishab((s) => s.books);
  const back = useHishab((s) => s.back);
  const goTab = useHishab((s) => s.goTab);
  const entry = books.entries.find((item) => item.id === entryId);
  if (!entry) {
    return (
      <Page>
        <ScreenHeader title="হিসাব" onBack={back} />
        <Callout title="পাওয়া যায়নি" body="এই হিসাবটা খাতায় নেই।" />
      </Page>
    );
  }
  const view = explain(books, entry);
  return (
    <div>
      <ScreenHeader title="হিসাব সেভ হয়েছে" onBack={() => goTab("home")} />
      <Page>
        <div className="rounded-2xl bg-palm px-4 py-5 text-paper">
          <p className="text-sm text-foam">এই ফোনে সেভ হয়েছে</p>
          <h2 className="mt-1 font-display text-3xl font-semibold">{view.title}</h2>
          <p className="mt-2 text-base leading-relaxed">{entry.summary}</p>
        </div>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
          {view.rows.map((row) => (
            <p key={row.k} className="flex items-baseline justify-between gap-3 py-1">
              <span className="text-sm text-ink-soft">{row.k}</span>
              <span className="font-display text-lg font-semibold text-ink">{row.v}</span>
            </p>
          ))}
          {view.foot ? <p className="mt-2 text-sm text-ink-soft">{view.foot}</p> : null}
          {entry.partyId ? (
            <p className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
              <span className="text-sm text-ink-soft">এখন পাওনা</span>
              <span className="font-display text-lg font-semibold text-ink">
                {formatTaka(balance(books, "receivable", entry.partyId))}
              </span>
            </p>
          ) : null}
        </div>
        <Primary onClick={() => goTab("home")}>আজকের হিসাবে ফিরুন</Primary>
      </Page>
    </div>
  );
}

export function beginDraft(kind: Draft["kind"], books: Books, extra: Partial<Draft> = {}): Draft {
  const draft = blankDraft(kind, extra);
  const product = productById(books, draft.productId);
  if (product) {
    if (!extra.unitPriceTaka) draft.unitPriceTaka = Math.round(product.pricePaisa / 100);
    if (!extra.costTaka) draft.costTaka = Math.round(product.costPaisa / 100);
  }
  draft.step = firstGap(draft, books);
  return draft;
}
