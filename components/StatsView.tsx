"use client";

import { Kid, Task, TaskLog, formatKDate } from "@/lib/types";
import {
  computeDailyStats,
  currentStreak,
  totalCompletedDays,
  averageRate,
  taskCompletionBreakdown,
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

  return (
    <div className="px-4 sm:px-6 pb-10 max-w-2xl mx-auto w-full">
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
