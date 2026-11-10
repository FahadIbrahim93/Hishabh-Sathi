import { startOfLocalDay, toBnGrouped } from "@/lib/hishab/money";
import {
  balance,
  collectedBetween,
  duesAging,
  expenseBetween,
  profitBetween,
  revenueBetween,
} from "@/lib/hishab/engine";
import { formatTaka } from "@/lib/hishab/money";
import { useHishab } from "@/lib/hishab/store";
import {
  Page,
  ScreenHeader,
  Secondary,
} from "@/components/hishab/bits";

function moneyCard(title: string, value: string, note?: string) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-line">
      <p className="text-sm text-ink-soft">{title}</p>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      {note ? <p className="mt-1 text-xs text-ink-soft">{note}</p> : null}
    </div>
  );
}

export function ReportsScreen() {
  const books = useHishab((s) => s.books);
  const back = useHishab((s) => s.back);
  const now = Date.now();
  const todayStart = startOfLocalDay(now);
  const todayEnd = todayStart + 86_400_000;
  const d = new Date(now);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();

  const sales = revenueBetween(books, todayStart, todayEnd);
  const collections = collectedBetween(books, todayStart, todayEnd);
  const cash = balance(books, "cash");

  const monthRevenue = revenueBetween(books, monthStart, todayEnd);
  const monthExpense = expenseBetween(books, monthStart, todayEnd);
  const monthProfit = profitBetween(books, monthStart, todayEnd);

  const aging = duesAging(books, now);

  return (
    <div>
      <ScreenHeader title="রিপোর্ট" onBack={back} />
      <Page>
        <h2 className="font-display text-lg font-semibold text-ink">আজকের হিসাব</h2>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {moneyCard("বিক্রি", formatTaka(sales), "আজকের মোট বিক্রি")}
          {moneyCard("আদায়", formatTaka(collections), "আজ পাওনা আদায়")}
          {moneyCard("নগদ হাতে", formatTaka(cash), "গুদামের নগদ")}
        </div>

        <h2 className="font-display text-lg font-semibold text-ink mt-8">মাসের লাভ-ক্ষতি</h2>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {moneyCard("আয়", formatTaka(monthRevenue), `এই মাসের (${toBnGrouped(d.getDate())} তারিখ পর্যন্ত)`)}
          {moneyCard("খরচ", formatTaka(monthExpense), "খরচের হিসাব")}
          {moneyCard("লাভ", formatTaka(monthProfit), "আয় minus খরচ minus মালমতো")}
        </div>

        <h2 className="font-display text-lg font-semibold text-ink mt-8">পাওনা বয়স (বাকি বয়স)</h2>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-line mt-2">
          {aging.length === 0 ? (
            <p className="text-sm text-ink-soft">কেউ পাওনা দেন না।</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-ink-soft border-b border-line">
                  <th className="pb-2">দোকান</th>
                  <th className="pb-2 text-right">পাওনা</th>
                  <th className="pb-2 text-right">দিন বয়স</th>
                  <th className="pb-2">বয়স</th>
                </tr>
              </thead>
              <tbody>
                {aging.map((row) => (
                  <tr key={row.partyId} className="border-b border-line">
                    <td className="py-2 text-ink">{row.partyName}</td>
                    <td className="py-2 text-right text-ink">{formatTaka(row.receivable)}</td>
                    <td className="py-2 text-right text-ink">{row.days}</td>
                    <td className="py-2 text-ink">
                      {row.bucket === "0-7" ? "এই সপ্তাহ" : row.bucket === "8-30" ? "৮-৩০ দিন" : "৩০+ দিন"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Secondary onClick={back}>
            ফিরে যান
          </Secondary>
        </div>
      </Page>
    </div>
  );
}
