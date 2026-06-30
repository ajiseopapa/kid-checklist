"use client";

import { useMemo, useState } from "react";
import { Kid, Task, TaskLog, TimeSlot, TIME_SLOTS, todayStr, formatKDate } from "@/lib/types";
import { fireConfetti, fireBigConfetti } from "@/components/confetti";

export function ChecklistView({
  kid,
  tasks,
  taskLogs,
  onToggle,
}: {
  kid: Kid;
  tasks: Task[];
  taskLogs: TaskLog[];
  onToggle: (kidId: string, taskId: string) => Promise<string | undefined>;
}) {
  const today = todayStr();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  const kidTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.active && (t.kid_id === null || t.kid_id === kid.id))
        .sort((a, b) => a.sort_order - b.sort_order),
    [tasks, kid.id]
  );

  const doneMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const t of kidTasks) {
      map[t.id] = taskLogs.some(
        (l) => l.kid_id === kid.id && l.task_id === t.id && l.log_date === today && l.done
      );
    }
    return map;
  }, [kidTasks, taskLogs, kid.id, today]);

  const doneCount = Object.values(doneMap).filter(Boolean).length;
  const total = kidTasks.length;
  const allDone = total > 0 && doneCount === total;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  // 시간대별 그룹핑
  const slotGroups = useMemo(() => {
    const groups: Record<TimeSlot, Task[]> = {
      morning: [], afternoon: [], evening: [], anytime: [],
    };
    for (const t of kidTasks) {
      const slot = t.time_slot ?? "anytime";
      groups[slot].push(t);
    }
    return groups;
  }, [kidTasks]);

  const handleToggle = async (taskId: string) => {
    if (busyTaskId) return;
    setBusyTaskId(taskId);
    try {
      const wasAllDone = allDone;
      const result = await onToggle(kid.id, taskId);
      if (result === "completed" && !wasAllDone) {
        setJustCompleted(true);
        fireBigConfetti();
        setTimeout(() => setJustCompleted(false), 2600);
      } else if (!doneMap[taskId]) {
        fireConfetti();
      }
    } finally {
      setBusyTaskId(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 pb-10 max-w-2xl mx-auto w-full">
      {/* 진행률 카드 */}
      <div className="blob-card p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="font-display text-lg">{formatKDate(today)}</p>
          <p className="text-sm font-bold" style={{ color: "var(--color-grape-deep)" }}>
            {doneCount} / {total}
          </p>
        </div>
        <div className="h-4 rounded-full overflow-hidden" style={{ background: "var(--color-cream-deep)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--color-mint), var(--color-mint-deep))",
            }}
          />
        </div>
      </div>

      {justCompleted && (
        <div className="blob-card p-5 mb-5 text-center animate-pop-in" style={{ background: "var(--color-sun)" }}>
          <p className="font-display text-2xl">🎉 오늘 할 일 다 했어요!</p>
          <p className="text-sm mt-1">⭐ 별 1개를 받았어요!</p>
        </div>
      )}

      {kidTasks.length === 0 ? (
        <div className="blob-card p-8 text-center">
          <div className="text-5xl mb-3">📝</div>
          <p className="font-display text-lg">아직 등록된 일과가 없어요</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-ink-soft)" }}>
            부모님 모드에서 일과를 추가해주세요
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {TIME_SLOTS.map((slot) => {
            const slotTasks = slotGroups[slot.key];
            if (slotTasks.length === 0) return null;
            const slotDone = slotTasks.filter((t) => doneMap[t.id]).length;
            return (
              <div key={slot.key}>
                {/* 시간대 헤더 */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-xl">{slot.icon}</span>
                  <span className="font-display text-base">{slot.label}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold ml-auto"
                    style={{ background: slot.color + "55", color: "var(--color-ink)" }}
                  >
                    {slotDone}/{slotTasks.length}
                  </span>
                </div>
                {/* 일과 목록 */}
                <div className="flex flex-col gap-3">
                  {slotTasks.map((task) => {
                    const done = doneMap[task.id];
                    const busy = busyTaskId === task.id;
                    return (
                      <button
                        key={task.id}
                        onClick={() => handleToggle(task.id)}
                        disabled={busy}
                        className="blob-card press-pop flex items-center gap-4 p-4 text-left w-full"
                        style={
                          done
                            ? { background: "linear-gradient(135deg, var(--color-mint), #ffffff)" }
                            : undefined
                        }
                      >
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                          style={{ background: done ? "white" : slot.color + "44" }}
                        >
                          {task.icon}
                        </div>
                        <span
                          className={`font-display text-lg flex-1 ${done ? "opacity-60" : ""}`}
                          style={done ? { textDecoration: "line-through" } : undefined}
                        >
                          {task.title}
                        </span>
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0 ${done ? "animate-stamp" : ""}`}
                          style={{
                            background: done ? "var(--color-mint-deep)" : "white",
                            border: done ? "none" : "2px solid var(--color-cream-deep)",
                          }}
                        >
                          {done ? "✓" : ""}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
