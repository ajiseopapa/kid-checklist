"use client";

import { Kid } from "@/lib/types";
import { StarBadge } from "@/components/StarBadge";

export function KidPicker({
  kids,
  onPick,
  onOpenAdmin,
}: {
  kids: Kid[];
  onPick: (kid: Kid) => void;
  onOpenAdmin: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="text-center mb-10">
        <div className="text-6xl mb-3 animate-float">🌈</div>
        <h1 className="font-display text-4xl" style={{ color: "var(--color-ink)" }}>
          누가 할까요?
        </h1>
        <p className="mt-2 text-base" style={{ color: "var(--color-ink-soft)" }}>
          이름을 눌러서 오늘의 체크리스트를 시작해요
        </p>
      </div>

      {kids.length === 0 ? (
        <div className="blob-card px-8 py-10 text-center max-w-sm">
          <div className="text-5xl mb-3">🐣</div>
          <p className="font-display text-lg mb-2">아직 등록된 아이가 없어요</p>
          <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            관리자 모드에서 아이를 먼저 등록해주세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 w-full max-w-2xl">
          {kids.map((kid) => (
            <button
              key={kid.id}
              onClick={() => onPick(kid)}
              className="blob-card press-pop flex flex-col items-center gap-2 py-6 px-3"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{ background: kid.color + "55" }}
              >
                {kid.avatar}
              </div>
              <span className="font-display text-lg">{kid.name}</span>
              <StarBadge count={kid.star_balance} size="sm" />
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onOpenAdmin}
        className="mt-12 text-sm underline opacity-60 hover:opacity-100 press-pop"
        style={{ color: "var(--color-ink-soft)" }}
      >
        🔐 부모님 모드
      </button>
    </div>
  );
}
