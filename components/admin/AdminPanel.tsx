"use client";

import { useState } from "react";
import { Kid, Task, ShopItem, StarTransaction } from "@/lib/types";
import { KidsManager } from "@/components/admin/KidsManager";
import { GiftStars } from "@/components/admin/GiftStars";
import { TasksManager } from "@/components/admin/TasksManager";
import { ShopManager } from "@/components/admin/ShopManager";
import { DataManager } from "@/components/admin/DataManager";
import { PasswordChanger } from "@/components/admin/PasswordChanger";
import { WeeklyBonusSettings } from "@/components/admin/WeeklyBonusSettings";

type AdminTab = "kids" | "gift" | "tasks" | "shop" | "data" | "password";

export function AdminPanel({
  kids,
  tasks,
  shopItems,
  transactions,
  weeklyBonusStars,
  onClose,
  onReload,
  onGiftStars,
  onUpdateWeeklyBonusStars,
}: {
  kids: Kid[];
  tasks: Task[];
  shopItems: ShopItem[];
  transactions: StarTransaction[];
  weeklyBonusStars: number;
  onClose: () => void;
  onReload: () => Promise<void>;
  onGiftStars: (kidId: string, amount: number, memo?: string) => Promise<void>;
  onUpdateWeeklyBonusStars: (amount: number) => Promise<void>;
}) {
  const [tab, setTab] = useState<AdminTab>("kids");

  const tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: "kids", label: "아이", icon: "👶" },
    { key: "gift", label: "별 선물", icon: "🎀" },
    { key: "tasks", label: "일과", icon: "📋" },
    { key: "shop", label: "상점", icon: "🏪" },
    { key: "data", label: "백업", icon: "💾" },
    { key: "password", label: "비밀번호", icon: "🔑" },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-app overflow-y-auto">
      <div className="sticky top-0 z-10 bg-app px-4 sm:px-6 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-xl">🔐 부모님 모드</p>
          <button
            onClick={onClose}
            className="press-pop rounded-full px-4 py-2 text-sm font-display"
            style={{ background: "white" }}
          >
            ✕ 닫기
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="press-pop shrink-0 flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-display"
              style={
                tab === t.key
                  ? {
                      background:
                        "linear-gradient(135deg, var(--color-grape), var(--color-grape-deep))",
                      color: "white",
                    }
                  : { background: "white", color: "var(--color-ink-soft)" }
              }
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-16 max-w-2xl mx-auto w-full">
        {tab === "kids" && <KidsManager kids={kids} onChange={onReload} />}
        {tab === "gift" && <GiftStars kids={kids} onGift={onGiftStars} />}
        {tab === "tasks" && (
          <>
            <WeeklyBonusSettings weeklyBonusStars={weeklyBonusStars} onUpdate={onUpdateWeeklyBonusStars} />
            <TasksManager tasks={tasks} kids={kids} onChange={onReload} />
          </>
        )}
        {tab === "shop" && <ShopManager shopItems={shopItems} onChange={onReload} />}
        {tab === "data" && <DataManager onReload={onReload} />}
        {tab === "password" && <PasswordChanger />}

        {tab === "gift" && transactions.length > 0 && (
          <RecentTransactions kids={kids} transactions={transactions} />
        )}
      </div>
    </div>
  );
}

function RecentTransactions({
  kids,
  transactions,
}: {
  kids: Kid[];
  transactions: StarTransaction[];
}) {
  const reasonLabel: Record<string, string> = {
    daily_complete: "✅ 일과 완료 보상",
    weekly_complete: "🎯 주간 목표 보너스",
    parent_gift: "🎀 부모님 선물",
    shop_purchase: "🛍️ 상점 구매",
    manual_adjust: "⚙️ 조정",
  };

  return (
    <div className="blob-card p-5">
      <p className="font-display text-base mb-3">📜 최근 별 기록</p>
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {transactions.slice(0, 20).map((tx) => {
          const kid = kids.find((k) => k.id === tx.kid_id);
          return (
            <div key={tx.id} className="flex items-center gap-2 text-sm">
              <span>{kid?.avatar ?? "👤"}</span>
              <span className="flex-1" style={{ color: "var(--color-ink-soft)" }}>
                {kid?.name ?? "알 수 없음"} · {reasonLabel[tx.reason] ?? tx.reason}
                {tx.memo ? ` (${tx.memo})` : ""}
              </span>
              <span
                className="font-bold"
                style={{ color: tx.amount >= 0 ? "var(--color-mint-deep)" : "#D9534F" }}
              >
                {tx.amount >= 0 ? "+" : ""}
                {tx.amount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
