"use client";

import { useState } from "react";
import { useAppData } from "@/lib/hooks/useAppData";
import { Kid } from "@/lib/types";
import { KidPicker } from "@/components/KidPicker";
import { KidHeader, ViewMode } from "@/components/KidHeader";
import { ChecklistView } from "@/components/ChecklistView";
import { ShopView } from "@/components/ShopView";
import { StatsView } from "@/components/StatsView";
import { AdminLoginModal } from "@/components/admin/AdminLoginModal";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  const {
    kids,
    tasks,
    taskLogs,
    shopItems,
    transactions,
    weeklyBonusStars,
    loading,
    error,
    reload,
    toggleTask,
    addStars,
    purchaseItem,
    updateWeeklyBonusStars,
  } = useAppData();

  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("checklist");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const selectedKid = kids.find((k) => k.id === selectedKidId) ?? null;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="text-5xl animate-float">🐰</div>
        <p className="font-display" style={{ color: "var(--color-ink-soft)" }}>
          불러오는 중이에요...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-5xl">😵</div>
        <p className="font-display">데이터를 불러오지 못했어요</p>
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {error}
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--color-ink-soft)" }}>
          .env.local 의 Supabase 설정을 확인해주세요
        </p>
      </div>
    );
  }

  const handlePick = (kid: Kid) => {
    setSelectedKidId(kid.id);
    setMode("checklist");
  };

  return (
    <div className="flex-1 flex flex-col">
      {!selectedKid ? (
        <KidPicker kids={kids} onPick={handlePick} onOpenAdmin={() => setShowAdminLogin(true)} />
      ) : (
        <>
          <KidHeader
            kid={selectedKid}
            mode={mode}
            onModeChange={setMode}
            onSwitchKid={() => setSelectedKidId(null)}
          />
          {mode === "checklist" && (
            <ChecklistView
              kid={selectedKid}
              tasks={tasks}
              taskLogs={taskLogs}
              onToggle={toggleTask}
            />
          )}
          {mode === "shop" && (
            <ShopView kid={selectedKid} shopItems={shopItems} onPurchase={purchaseItem} />
          )}
          {mode === "stats" && (
            <StatsView kid={selectedKid} tasks={tasks} taskLogs={taskLogs} />
          )}
        </>
      )}

      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onSuccess={() => {
            setShowAdminLogin(false);
            setShowAdminPanel(true);
          }}
        />
      )}

      {showAdminPanel && (
        <ErrorBoundary>
          <AdminPanel
            kids={kids}
            tasks={tasks}
            shopItems={shopItems}
            transactions={transactions}
            weeklyBonusStars={weeklyBonusStars}
            onClose={() => setShowAdminPanel(false)}
            onReload={reload}
            onGiftStars={async (kidId, amount, memo) => {
              await addStars(kidId, amount, "parent_gift", memo);
            }}
            onUpdateWeeklyBonusStars={updateWeeklyBonusStars}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
