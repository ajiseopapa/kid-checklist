"use client";

import { useState } from "react";
import { Kid, ShopItem } from "@/lib/types";
import { fireConfetti } from "@/components/confetti";

export function ShopView({
  kid,
  shopItems,
  onPurchase,
}: {
  kid: Kid;
  shopItems: ShopItem[];
  onPurchase: (kidId: string, item: ShopItem) => Promise<unknown>;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justBought, setJustBought] = useState<ShopItem | null>(null);

  const activeItems = shopItems
    .filter((i) => i.active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const handleBuy = async (item: ShopItem) => {
    setError(null);
    setBusyId(item.id);
    try {
      await onPurchase(kid.id, item);
      setJustBought(item);
      fireConfetti();
      setTimeout(() => setJustBought(null), 2200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "구매 중 문제가 생겼어요");
      setTimeout(() => setError(null), 2500);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 pb-10 max-w-2xl mx-auto w-full">
      <div className="blob-card p-5 mb-5 text-center" style={{ background: "var(--color-grape)" }}>
        <p className="font-display text-lg text-white">🏪 별을 모아서 선물을 바꿔보아요!</p>
      </div>

      {justBought && (
        <div className="blob-card p-4 mb-4 text-center animate-pop-in" style={{ background: "var(--color-sun)" }}>
          <p className="font-display">
            {justBought.icon} {justBought.name} 받았어요!
          </p>
        </div>
      )}
      {error && (
        <div className="blob-card p-4 mb-4 text-center animate-wiggle" style={{ background: "var(--color-pink)" }}>
          <p className="font-display text-sm">{error}</p>
        </div>
      )}

      {activeItems.length === 0 ? (
        <div className="blob-card p-8 text-center">
          <div className="text-5xl mb-3">🎁</div>
          <p className="font-display text-lg">아직 상점에 선물이 없어요</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {activeItems.map((item) => {
            const soldOut = item.stock !== null && item.stock <= 0;
            const canBuy = kid.star_balance >= item.price && !soldOut;
            const busy = busyId === item.id;
            return (
              <div key={item.id} className="blob-card p-4 flex flex-col items-center gap-2">
                <div className="text-4xl">{item.icon}</div>
                <p className="font-display text-sm text-center leading-tight">{item.name}</p>
                {item.stock !== null && (
                  <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
                    {soldOut ? "품절!" : `남은 수량 ${item.stock}개`}
                  </p>
                )}
                <button
                  onClick={() => handleBuy(item)}
                  disabled={!canBuy || busy}
                  className="press-pop w-full rounded-full py-2 font-display text-sm mt-1"
                  style={{
                    background: canBuy
                      ? "linear-gradient(135deg, var(--color-sun), var(--color-sun-deep))"
                      : "var(--color-cream-deep)",
                    color: canBuy ? "var(--color-ink)" : "var(--color-ink-soft)",
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  ⭐ {item.price}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
