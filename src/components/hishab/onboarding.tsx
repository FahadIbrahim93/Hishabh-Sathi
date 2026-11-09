import { useState } from "react";
import { takaToPaisa, toBnGrouped } from "@/lib/hishab/money";
import { useHishab } from "@/lib/hishab/store";
import {
  Primary,
  Secondary,
  ScreenHeader,
  Page,
  TextField,
} from "@/components/hishab/bits";

export function OnboardingScreen() {
  const createBusiness = useHishab((s) => s.createBusiness);
  const resetDemo = useHishab((s) => s.resetDemo);
  const setOnboarded = useHishab((s) => s.setOnboarded);
  const [name, setName] = useState("");
  const [cashTaka, setCashTaka] = useState(0);
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createBusiness(name.trim(), takaToPaisa(cashTaka));
    } finally {
      setSaving(false);
    }
  };

  const useDemo = async () => {
    setSaving(true);
    try {
      resetDemo();
      setOnboarded(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <ScreenHeader title="দোকান চুনো" />
      <div className="mx-auto max-w-md space-y-5 px-6">
        <TextField
          label="দোকানের নাম"
          placeholder="যেমন: রফিক ট্রেডার্স"
          value={name}
          onChange={(value) => setName(value)}
        />
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-ink">শুরুর নগদ (টাকা)</label>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(10).keys()].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() =>
                  setCashTaka((c) =>
                    c < 1_00_00_000 ? c * 10 + d : c
                  )
                }
                className="min-h-14 rounded-xl border border-line bg-card text-ink font-semibold"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCashTaka(0)}
              className="min-h-14 rounded-xl border border-line bg-card text-ink font-semibold"
            >
                ০
            </button>
            <button
              type="button"
              onClick={() => setCashTaka((c) => Math.floor(c / 10))}
              className="min-h-14 rounded-xl border border-line bg-card text-ink font-semibold"
            >
                ⌫
            </button>
          </div>
          <p className="text-sm text-ink-soft">
            ৳ {toBnGrouped(cashTaka)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Secondary onClick={useDemo}>
            ডেমো দোকান দিয়ে শুরু করুন
          </Secondary>
          <Primary onClick={create} disabled={saving || !name.trim()}>
            শুরু করুন
          </Primary>
        </div>
        <p className="text-sm text-ink-soft leading-relaxed">
          সব হিসাব এই ফোনে ঠিকমত সংরক্ষিত থাকবে। মাল রাখা মাল বিক্রি নয়
          — ওটা এখনও আপনার। যেখানে খুব প্রয়োজন, সেখানে শুধু নগদ দিন।
        </p>
      </div>
    </Page>
  );
}
