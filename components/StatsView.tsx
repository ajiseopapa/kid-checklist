"use client";

import { Kid, Task, TaskLog, formatKDate } from "@/lib/types";
import {
  computeDailyStats,
  currentStreak,
  totalCompletedDays,
  averageRate,
  taskCompletionBreakdown,
  computeWeeklyProgress,
} from "@/lib/stats";

export function StatsView({
  kid,
  tasks,
  taskLogs,
}: {
  kid: Kid;
  tasks: Task[];
  taskLogs: TaskLog[];
}) {
  const dayStats = computeDailyStats(kid.id, tasks, taskLogs, 14);
  const streak = currentStreak(dayStats);
  const completedDays = totalCompletedDays(dayStats);
  const avgRate = averageRate(dayStats);
  const breakdown = taskCompletionBreakdown(kid.id, tasks, taskLogs, 14);
  const weekly = computeWeeklyProgress(kid.id, tasks, taskLogs);

  const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div className="px-4 sm:px-6 pb-10 max-w-2xl mx-auto w-full">
      {/* 주간 목표 카드 */}
      <div
        className="blob-card p-5 mb-5"
        style={{
          background: weekly.isComplete
            ? "linear-gradient(135deg, var(--color-sun), var(--color-sun-deep))"
            : undefined,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="font-display text-base">🎯 이번 주 목표</p>
          <p className="text-sm font-bold" style={{ color: "var(--color-grape-deep)" }}>
            {weekly.perfectDays} / 7일 완벽 달성
          </p>
        </div>

        <div className="flex justify-between gap-1.5 mb-3">
          {weekly.weekDates.map((date, i) => {
            const isPerfect = weekly.dayPerfect[i];
            const isToday = i === weekly.todayIndex;
            const isFuture = weekly.todayIndex >= 0 && i > weekly.todayIndex;
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px]" style={{ color: "var(--color-ink-soft)" }}>
                  {weekdayLabels[i]}
                </span>
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-base ${
                    isToday ? "animate-pop-in" : ""
                  }`}
                  style={{
                    background: isPerfect
                      ? "var(--color-mint-deep)"
                      : isFuture
                      ? "var(--color-cream-deep)"
                      : "white",
                    border: isToday ? "2px solid var(--color-grape-deep)" : "2px solid transparent",
                    opacity: isFuture ? 0.5 : 1,
                  }}
                >
                  {isPerfect ? "⭐" : ""}
                </div>
              </div>
            );
          })}
        </div>

        {weekly.isComplete ? (
          <p className="text-center font-display text-sm">
            🎉 이번 주 완벽 달성! 보너스 별을 받았어요!
          </p>
        ) : (
          <p className="text-center text-xs" style={{ color: "var(--color-ink-soft)" }}>
            7일 모두 완벽하게 해내면 보너스 별을 받을 수 있어요!
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard icon="🔥" label="연속 완료" value={`${streak}일`} bg="var(--color-apricot)" />
        <StatCard icon="🏆" label="완벽한 날" value={`${completedDays}일`} bg="var(--color-mint)" />
        <StatCard icon="📈" label="평균 달성률" value={`${avgRate}%`} bg="var(--color-grape)" />
      </div>

      <div className="blob-card p-5 mb-5">
        <p className="font-display text-base mb-4">📅 최근 14일 달성률</p>
        <div className="flex items-end gap-1.5 h-32">
          {dayStats.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${Math.max(d.rate, 4)}%`,
                    background: d.allDone
                      ? "linear-gradient(180deg, var(--color-sun), var(--color-sun-deep))"
                      : d.rate > 0
                      ? "var(--color-mint)"
                      : "var(--color-cream-deep)",
                  }}
                  title={`${formatKDate(d.date)}: ${d.rate}%`}
                />
              </div>
              {d.allDone && <span className="text-xs">⭐</span>}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px]" style={{ color: "var(--color-ink-soft)" }}>
          <span>{formatKDate(dayStats[0]?.date ?? "")}</span>
          <span>오늘</span>
        </div>
      </div>

      <div className="blob-card p-5">
        <p className="font-display text-base mb-4">📋 일과별 누적 현황 (14일)</p>
        <div className="flex flex-col gap-3">
          {breakdown.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--color-ink-soft)" }}>
              등록된 일과가 없어요
            </p>
          ) : (
            breakdown.map(({ task, done, total, rate }) => (
              <div key={task.id} className="flex items-center gap-3">
                <div className="text-xl shrink-0">{task.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{task.title}</span>
                    <span style={{ color: "var(--color-ink-soft)" }}>
                      {done}/{total}일
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-cream-deep)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${rate}%`, background: "var(--color-grape-deep)" }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: string;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className="blob-card p-3.5 flex flex-col items-center text-center" style={{ background: bg }}>
      <span className="text-2xl">{icon}</span>
      <span className="font-display text-lg mt-1">{value}</span>
      <span className="text-[11px]" style={{ color: "var(--color-ink)" }}>
        {label}
      </span>
    </div>
  );
}
