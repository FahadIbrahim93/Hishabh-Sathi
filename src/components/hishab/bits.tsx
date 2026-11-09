import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toBn, toBnGrouped } from "@/lib/hishab/money";

export function ScreenHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-1 bg-paper px-2 py-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="পিছনে"
          className="grid size-12 shrink-0 place-items-center rounded-full text-ink"
        >
          <ChevronLeft className="size-6" />
        </button>
      ) : null}
      <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
    </header>
  );
}

export function Primary({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-palm px-4 font-display text-lg font-semibold text-paper disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function Secondary({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-card px-4 font-display text-base font-semibold text-ink ring-1 ring-line"
    >
      {children}
    </button>
  );
}

export function Choice({
  title,
  detail,
  onClick,
  selected,
}: {
  title: string;
  detail?: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ring-1 ${
        selected ? "bg-palm-soft ring-palm" : "bg-card ring-line"
      }`}
    >
      <span className="min-w-0">
        <span className="block font-display text-lg font-semibold text-ink">{title}</span>
        {detail ? <span className="mt-0.5 block text-sm text-ink-soft">{detail}</span> : null}
      </span>
      <ChevronRight className="size-5 shrink-0 text-ink-soft" aria-hidden="true" />
    </button>
  );
}

export function Callout({
  title,
  body,
  tone = "info",
}: {
  title: string;
  body: string;
  tone?: "info" | "warn";
}) {
  const toneClass =
    tone === "warn" ? "bg-clay-soft text-ink ring-clay" : "bg-saffron-soft text-ink ring-saffron";
  return (
    <div className={`rounded-2xl px-4 py-3 ring-1 ${toneClass}`}>
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

export function Field({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const className = `flex min-h-16 w-full items-center justify-between rounded-2xl px-4 text-left ring-1 ${
    active ? "bg-palm-soft ring-palm" : "bg-card ring-line"
  }`;
  const inner = (
    <>
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="font-display text-2xl font-semibold text-ink tabular-nums">{toBnGrouped(value)}</span>
    </>
  );
  if (!onClick) return <div className={className}>{inner}</div>;
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

const PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"] as const;

export function NumPad({ onDigit, onClear, onBack }: { onDigit: (n: number) => void; onClear: () => void; onBack: () => void }) {
  return (
    <div className="grid grid-cols-3 gap-2" aria-label="সংখ্যার প্যাড">
      {PAD.map((key) => {
        const label = key === "clear" ? "মুছুন" : key === "back" ? "মুছুন এক ঘর" : toBn(Number(key));
        return (
          <button
            key={key}
            type="button"
            aria-label={label}
            onClick={() => {
              if (key === "clear") onClear();
              else if (key === "back") onBack();
              else onDigit(Number(key));
            }}
            className="flex min-h-12 items-center justify-center rounded-2xl bg-card font-display text-xl font-semibold text-ink ring-1 ring-line"
          >
            {key === "back" ? "⌫" : key === "clear" ? "সব" : toBn(Number(key))}
          </button>
        );
      })}
    </div>
  );
}

export function pushDigit(current: number, digit: number): number {
  const next = Number(`${current || ""}${digit}`.replace(/^0+(\d)/, "$1"));
  if (!Number.isFinite(next) || next > 10_000_000) return current;
  return next;
}

export function popDigit(current: number): number {
  const next = String(current).slice(0, -1);
  return next ? Number(next) : 0;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-ink-soft">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl bg-card px-4 text-base text-ink ring-1 ring-line outline-none placeholder:text-ink-soft"
      />
    </label>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 px-4 pb-8">{children}</div>;
}
