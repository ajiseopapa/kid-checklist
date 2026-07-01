export type Kid = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  star_balance: number;
  sort_order: number;
  created_at: string;
};

export type TimeSlot = "morning" | "afternoon" | "evening" | "anytime";

export const TIME_SLOTS: { key: TimeSlot; label: string; icon: string; color: string }[] = [
  { key: "morning",   label: "아침",  icon: "🌅", color: "#FFD93D" },
  { key: "afternoon", label: "점심",  icon: "☀️", color: "#FFB996" },
  { key: "evening",   label: "저녁",  icon: "🌙", color: "#C9B8FF" },
  { key: "anytime",   label: "언제든", icon: "✨", color: "#A8E6CE" },
];

export type Task = {
  id: string;
  kid_id: string | null;
  title: string;
  icon: string;
  time_slot: TimeSlot;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type TaskLog = {
  id: string;
  kid_id: string;
  task_id: string;
  log_date: string;
  done: boolean;
  done_at: string | null;
  created_at: string;
};

export type DailyReward = {
  id: string;
  kid_id: string;
  reward_date: string;
  stars_awarded: number;
  created_at: string;
};

export type StarTransaction = {
  id: string;
  kid_id: string;
  amount: number;
  reason: "daily_complete" | "parent_gift" | "shop_purchase" | "manual_adjust" | "weekly_complete";
  memo: string | null;
  created_at: string;
};

export type ShopItem = {
  id: string;
  name: string;
  icon: string;
  price: number;
  stock: number | null;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type Purchase = {
  id: string;
  kid_id: string;
  shop_item_id: string | null;
  item_name_snapshot: string;
  item_icon_snapshot: string;
  price: number;
  created_at: string;
};

export const AVATAR_OPTIONS = [
  "🐰", "🐻", "🐱", "🐶", "🦊", "🐼", "🐨", "🐯",
  "🦁", "🐸", "🐷", "🐹", "🐵", "🦄", "🐣", "🦋",
];

export const COLOR_OPTIONS = [
  { name: "살구", value: "#FFB996" },
  { name: "민트", value: "#A8E6CE" },
  { name: "라벤더", value: "#C9B8FF" },
  { name: "옐로우", value: "#FFD93D" },
  { name: "핑크", value: "#FFAAC9" },
  { name: "스카이", value: "#9ED8FF" },
];

export type WeeklyReward = {
  id: string;
  kid_id: string;
  week_start: string; // 그 주 월요일 날짜
  stars_awarded: number;
  created_at: string;
};

export function todayStr(): string {
  const d = new Date();
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}

export function dateStr(d: Date): string {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}

export function formatKDate(dateString: string): string {
  const d = new Date(dateString + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

/** 이번 주 월요일 날짜(YYYY-MM-DD)를 구해요. 월~일 기준 */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=일, 1=월 ... 6=토
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return dateStr(d);
}

/** 월요일 날짜 문자열로부터 그 주 7일(월~일) 날짜 배열을 구해요 */
export function getWeekDates(weekStart: string): string[] {
  const start = new Date(weekStart + "T00:00:00");
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(dateStr(d));
  }
  return out;
}
