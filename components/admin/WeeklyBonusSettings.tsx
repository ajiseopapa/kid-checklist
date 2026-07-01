"use client";

import { useState } from "react";
import { AdminSection, AdminButton } from "@/components/admin/AdminUI";

export function WeeklyBonusSettings({
  weeklyBonusStars,
  onUpdate,
}: {
  weeklyBonusStars: number;
  onUpdate: (amount: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState(weeklyBonusStars);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setBusy(true);
    try {
      await onUpdate(amount);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminSection title="주간 목표 보너스" icon="🎯">
      <p className="text-sm mb-4" style={{ color: "var(--color-ink-soft)" }}>
        한 주(월~일) 7일을 모두 완벽하게 해내면 받는 보너스 별 개수예요.
      </p>
      <div className="flex items-center gap-2 mb-3">
        <AdminButton variant="ghost" onClick={() => setAmount((a) => Math.max(1, a - 1))}>
          −
        </AdminButton>
        <div className="flex-1 text-center font-display text-xl">⭐ {amount}개</div>
        <AdminButton variant="ghost" onClick={() => setAmount((a) => a + 1)}>
          +
        </AdminButton>
      </div>
      {saved && (
        <p className="text-sm text-center mb-3 font-display animate-pop-in" style={{ color: "var(--color-mint-deep)" }}>
          저장됐어요!
        </p>
      )}
      <AdminButton onClick={handleSave} disabled={busy || amount === weeklyBonusStars} className="w-full">
        저장하기
      </AdminButton>
    </AdminSection>
  );
}
