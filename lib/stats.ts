import { Kid, Task, TaskLog, dateStr, getWeekStart, getWeekDates } from "@/lib/types";

export type DayStat = {
  date: string;
  total: number;
  done: number;
  rate: number; // 0~100
  allDone: boolean;
};

export function getLastNDates(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(dateStr(d));
  }
  return out;
}

export function computeDailyStats(
  kidId: string,
  tasks: Task[],
  taskLogs: TaskLog[],
  days: number = 14
): DayStat[] {
  const kidTasks = tasks.filter(
    (t) => t.active && (t.kid_id === null || t.kid_id === kidId)
  );
  const dates = getLastNDates(days);

  return dates.map((date) => {
    const total = kidTasks.length;
    const done = kidTasks.filter((t) =>
      taskLogs.some(
        (l) => l.kid_id === kidId && l.task_id === t.id && l.log_date === date && l.done
      )
    ).length;
    const rate = total === 0 ? 0 : Math.round((done / total) * 100);
    return { date, total, done, rate, allDone: total > 0 && done === total };
  });
}

export function currentStreak(dayStats: DayStat[]): number {
  let streak = 0;
  for (let i = dayStats.length - 1; i >= 0; i--) {
    if (dayStats[i].allDone) streak++;
    else break;
  }
  return streak;
}

export function totalCompletedDays(dayStats: DayStat[]): number {
  return dayStats.filter((d) => d.allDone).length;
}

export function averageRate(dayStats: DayStat[]): number {
  const withTasks = dayStats.filter((d) => d.total > 0);
  if (withTasks.length === 0) return 0;
  const sum = withTasks.reduce((acc, d) => acc + d.rate, 0);
  return Math.round(sum / withTasks.length);
}

export function taskCompletionBreakdown(
  kidId: string,
  tasks: Task[],
  taskLogs: TaskLog[],
  days: number = 14
) {
  const kidTasks = tasks.filter(
    (t) => t.active && (t.kid_id === null || t.kid_id === kidId)
  );
  const dates = getLastNDates(days);
  return kidTasks.map((task) => {
    const done = dates.filter((date) =>
      taskLogs.some(
        (l) => l.kid_id === kidId && l.task_id === task.id && l.log_date === date && l.done
      )
    ).length;
    return {
      task,
      done,
      total: dates.length,
      rate: Math.round((done / dates.length) * 100),
    };
  });
}

export function kidLeaderboard(kids: Kid[]) {
  return [...kids].sort((a, b) => b.star_balance - a.star_balance);
}

export type WeeklyProgress = {
  weekStart: string;
  weekDates: string[];
  dayPerfect: boolean[]; // weekDates와 같은 순서, 각 날짜의 완벽 달성 여부
  perfectDays: number; // 완벽 달성한 날 수
  totalDays: number; // 7
  isComplete: boolean; // 7일 전부 완벽 달성했는지
  todayIndex: number; // 오늘이 이번 주 몇 번째 날인지 (0=월)
};

/** 이번 주(월~일) 완벽 달성 현황을 계산해요 */
export function computeWeeklyProgress(
  kidId: string,
  tasks: Task[],
  taskLogs: TaskLog[],
  referenceDate: Date = new Date()
): WeeklyProgress {
  const weekStart = getWeekStart(referenceDate);
  const weekDates = getWeekDates(weekStart);
  const today = dateStr(referenceDate);

  const kidTasks = tasks.filter(
    (t) => t.active && (t.kid_id === null || t.kid_id === kidId)
  );

  const dayPerfect = weekDates.map((date) => {
    if (kidTasks.length === 0) return false;
    return kidTasks.every((t) =>
      taskLogs.some(
        (l) => l.kid_id === kidId && l.task_id === t.id && l.log_date === date && l.done
      )
    );
  });

  const perfectDays = dayPerfect.filter(Boolean).length;

  return {
    weekStart,
    weekDates,
    dayPerfect,
    perfectDays,
    totalDays: 7,
    isComplete: perfectDays === 7,
    todayIndex: weekDates.indexOf(today),
  };
}
