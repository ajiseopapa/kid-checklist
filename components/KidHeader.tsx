"use client";

import { Kid } from "@/lib/types";
import { StarBadge } from "@/components/StarBadge";

export type ViewMode = "checklist" | "shop" | "stats";

export function KidHeader({
  kid,
  mode,
  onModeChange,
  onSwitchKid,
}: {
  kid: Kid;
  mode: ViewMode;
  onModeChange: (m: ViewMode) => void;
  onSwitchKid: () => void;
}) {
  const tabs: { key: ViewMode; label: string; icon: string }[] = [
    { key: "checklist", label: "체크리스트", icon: "✅" },
    { key: "shop", label: "선물 상점", icon: "🎁" },
    { key: "stats", label: "통계", icon: "📊" },
  ];

  return (
    <div className="px-4 sm:px-6 pt-5 pb-3 sticky top-0 z-20 bg-app">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onSwitchKid}
          className="flex items-center gap-2 press-pop blob-card !rounded-full pl-2 pr-4 py-1.5"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
            style={{ background: kid.color + "55" }}
          >
            {kid.avatar}
          </div>
          <span className="font-display text-base">{kid.name}</span>
        </button>
        <StarBadge count={kid.star_balance} size="md" />
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => {
          const active = mode === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onModeChange(tab.key)}
              className="press-pop flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl font-display text-sm sm:text-base transition-colors"
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, var(--color-grape), var(--color-grape-deep))",
                      color: "white",
                      boxShadow: "0 3px 0 rgba(91,70,54,0.15)",
                    }
                  : {
                      background: "white",
                      color: "var(--color-ink-soft)",
                    }
              }
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
