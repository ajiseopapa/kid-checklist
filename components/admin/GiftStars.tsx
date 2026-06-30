"use client";

import { useState } from "react";
import { Kid } from "@/lib/types";
import { AdminSection, AdminInput, AdminButton, EmptyRow } from "@/components/admin/AdminUI";

export function GiftStars({
  kids,
  onGift,
}: {
  kids: Kid[];
  onGift: (kidId: string, amount: number, memo?: string) => Promise<void>;
}) {
  const [selectedKidId, setSelectedKidId] = useState<string>(kids[0]?.id ?? "");
  const [amount, setAmount] = useState(1);
  const [memo, setMemo] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleGift = async () => {
    if (!selectedKidId || amount === 0) return;
    setBusy(true);
    try {
      await onGift(selectedKidId, amount, memo || undefined);
      const kid = kids.find((k) => k.id === selectedKidId);
      setToast(`${kid?.name}에게 별 ${amount > 0 ? "+" : ""}${amount}개 ${amount > 0 ? "선물" : "차감"} 완료!`);
      setMemo("");
      setTimeout(() => setToast(null), 2000);
    } finally {
      setBusy(false);
    }
  };

  if (kids.length === 0) {
    return (
      <AdminSection title="별 선물하기" icon="🎀">
        <EmptyRow text="먼저 아이를 등록해주세요" />
      </AdminSection>
    );
  }

  return (
    <AdminSection title="별 선물하기" icon="🎀">
      <div className="flex flex-wrap gap-2 mb-3">
        {kids.map((kid) => (
          <button
            key={kid.id}
            onClick={() => setSelectedKidId(kid.id)}
            className="press-pop flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
            style={{
              background: selectedKidId === kid.id ? "var(--color-grape)" : "var(--color-cream-deep)",
              color: selectedKidId === kid.id ? "white" : "var(--color-ink)",
            }}
          >
            <span>{kid.avatar}</span>
            <span>{kid.name}</span>
            <span className="opacity-70">⭐{kid.star_balance}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <AdminButton variant="ghost" onClick={() => setAmount((a) => a - 1)}>
          −
        </AdminButton>
        <div className="flex-1 text-center font-display text-xl">
          {amount > 0 ? `+${amount}` : amount} ⭐
        </div>
        <AdminButton variant="ghost" onClick={() => setAmount((a) => a + 1)}>
          +
        </AdminButton>
      </div>

      <AdminInput
        placeholder="이유 (예: 동생을 도와줘서)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="mb-3"
      />

      {toast && (
        <div className="text-center text-sm mb-3 font-display animate-pop-in">{toast}</div>
      )}

      <AdminButton onClick={handleGift} disabled={busy || amount === 0} className="w-full">
        {amount > 0 ? "🎁 선물하기" : "별 차감하기"}
      </AdminButton>
    </AdminSection>
  );
}
