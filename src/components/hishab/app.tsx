import { useEffect } from "react";
import { Home, Menu, Package, Wallet } from "lucide-react";
import { FlowScreen, ReceiptScreen } from "@/components/hishab/flows";
import { OnboardingScreen } from "@/components/hishab/onboarding";
import {
  DuesScreen,
  EntryScreen,
  GuideScreen,
  HomeScreen,
  LedgerScreen,
  MoreScreen,
  ShopScreen,
  StockScreen,
  VisitScreen,
} from "@/components/hishab/screens";
import { balance, collectedBetween, revenueBetween } from "@/lib/hishab/engine";
import { formatTaka, startOfLocalDay } from "@/lib/hishab/money";
import { useHishab, type TabId } from "@/lib/hishab/store";

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "আজ", icon: Home },
  { id: "dues", label: "বাকি", icon: Wallet },
  { id: "stock", label: "মাল", icon: Package },
  { id: "more", label: "আরও", icon: Menu },
];

export function HishabApp() {
  const ready = useHishab((s) => s.ready);
  const onboarded = useHishab((s) => s.onboarded);
  useEffect(() => {
    useHishab.getState().hydrate();
  }, []);

  return (
    <div className="min-h-dvh bg-palm-deep lg:flex lg:h-dvh lg:overflow-hidden">
      <Aside />
      <div className="flex h-dvh w-full min-w-0 flex-col bg-paper lg:flex-1">
        <div className="mx-auto flex h-full w-full max-w-md flex-col">
          {!ready ? <Splash /> : onboarded ? <Shell /> : <OnboardingScreen />}
        </div>
      </div>
    </div>
  );
}

function Splash() {
  return (
    <div className="flex h-full flex-col justify-end bg-palm px-6 pb-16 text-paper">
      <p className="h-1 w-16 rounded-full bg-saffron" />
      <h1 className="mt-4 font-display text-4xl font-semibold">হিসাব সাথী</h1>
      <p className="mt-2 text-lg text-foam">আপনার ব্যবসার হিসাব</p>
    </div>
  );
}

function Aside() {
  const ready = useHishab((s) => s.ready);
  const books = useHishab((s) => s.books);
  const now = Date.now();
  const start = startOfLocalDay(now);
  return (
    <aside className="hidden w-96 shrink-0 flex-col justify-between overflow-y-auto bg-palm-deep p-10 text-paper lg:flex">
      <div>
        <p className="h-1 w-16 rounded-full bg-saffron" />
        <p className="mt-6 font-display text-4xl font-semibold">হিসাব সাথী</p>
        <p className="mt-4 text-lg leading-relaxed text-foam">
          দোকানের হিসাব, হিসাবের ভাষায়। কথা বললেই টাকা বদলায় না — দেখে সেভ করলে তবেই।
        </p>
        <ul className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-foam">
          <li>বিক্রি, আদায়, মাল রাখা, ফেরত — একই জায়গায়।</li>
          <li>দোকানে রাখা মাল বিক্রি নয়। ওটা এখনও আপনার।</li>
          <li>ইন্টারনেট না থাকলেও হিসাব এই ফোনে থাকে।</li>
        </ul>
      </div>
      {ready ? (
        <div className="mt-8 rounded-2xl bg-palm p-4">
          <p className="text-sm text-foam">{books.businessName}</p>
          <p className="mt-3 flex justify-between text-sm">
            <span>আজ বিক্রি</span>
            <span className="font-display text-lg font-semibold">{formatTaka(revenueBetween(books, start, start + 86_400_000))}</span>
          </p>
          <p className="mt-2 flex justify-between text-sm">
            <span>আজ পেয়েছি</span>
            <span className="font-display text-lg font-semibold">{formatTaka(collectedBetween(books, start, start + 86_400_000))}</span>
          </p>
          <p className="mt-2 flex justify-between text-sm">
            <span>মোট পাওনা</span>
            <span className="font-display text-lg font-semibold">{formatTaka(balance(books, "receivable"))}</span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-foam">নিজ দোকান তৈরি করে শুরু করুন।</p>
      )}
    </aside>
  );
}

function Shell() {
  const nav = useHishab((s) => s.nav);
  const toast = useHishab((s) => s.toast);
  const dismissToast = useHishab((s) => s.dismissToast);
  const screen = nav[nav.length - 1] ?? { id: "home" as const };
  const showTabs = screen.id === "home" || screen.id === "dues" || screen.id === "stock" || screen.id === "more";

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => dismissToast(), 2600);
    return () => window.clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <div className="flex h-full min-h-0 flex-col" data-screen={screen.id}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {screen.id === "home" ? <HomeScreen /> : null}
        {screen.id === "dues" ? <DuesScreen /> : null}
        {screen.id === "stock" ? <StockScreen /> : null}
        {screen.id === "more" ? <MoreScreen /> : null}
        {screen.id === "visit" ? <VisitScreen /> : null}
        {screen.id === "shop" ? <ShopScreen partyId={screen.partyId} /> : null}
        {screen.id === "ledger" ? <LedgerScreen /> : null}
        {screen.id === "guide" ? <GuideScreen /> : null}
        {screen.id === "entry" ? <EntryScreen entryId={screen.entryId} /> : null}
        {screen.id === "flow" ? <FlowScreen /> : null}
        {screen.id === "receipt" ? <ReceiptScreen entryId={screen.entryId} /> : null}
      </div>
      {toast ? (
        <button type="button" onClick={dismissToast} className="bg-ink px-4 py-3 text-center text-sm text-paper">
          {toast}
        </button>
      ) : null}
      {showTabs ? <Tabs active={screen.id} /> : null}
    </div>
  );
}

function Tabs({ active }: { active: TabId }) {
  const goTab = useHishab((s) => s.goTab);
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-line bg-card" aria-label="মূল মেনু">
      {TABS.map((tab) => {
        const on = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => goTab(tab.id)}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
              on ? "text-palm" : "text-ink-soft"
            }`}
          >
            <tab.icon className="size-5" aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
