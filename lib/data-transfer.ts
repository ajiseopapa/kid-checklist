"use client";

import { createClient } from "@/lib/supabase/client";

export type ExportBundle = {
  version: 1;
  exported_at: string;
  kids: unknown[];
  tasks: unknown[];
  task_logs: unknown[];
  daily_rewards: unknown[];
  star_transactions: unknown[];
  shop_items: unknown[];
  purchases: unknown[];
};

export async function exportAllData(): Promise<ExportBundle> {
  const supabase = createClient();
  const tables = [
    "kids",
    "tasks",
    "task_logs",
    "daily_rewards",
    "star_transactions",
    "shop_items",
    "purchases",
  ] as const;

  const results = await Promise.all(
    tables.map((t) => supabase.from(t).select("*"))
  );

  results.forEach((r, i) => {
    if (r.error) throw new Error(`${tables[i]} 내보내기 실패: ${r.error.message}`);
  });

  return {
    version: 1,
    exported_at: new Date().toISOString(),
    kids: results[0].data ?? [],
    tasks: results[1].data ?? [],
    task_logs: results[2].data ?? [],
    daily_rewards: results[3].data ?? [],
    star_transactions: results[4].data ?? [],
    shop_items: results[5].data ?? [],
    purchases: results[6].data ?? [],
  };
}

export function downloadJson(bundle: ExportBundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `체크리스트-백업-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function validateBundle(obj: unknown): obj is ExportBundle {
  if (!obj || typeof obj !== "object") return false;
  const b = obj as Record<string, unknown>;
  return (
    b.version === 1 &&
    Array.isArray(b.kids) &&
    Array.isArray(b.tasks) &&
    Array.isArray(b.task_logs) &&
    Array.isArray(b.shop_items)
  );
}

/**
 * 전체 데이터를 비우고 백업 파일 내용으로 복원합니다.
 * 외래키 순서를 고려해 자식 테이블 -> 부모 테이블 순으로 삭제,
 * 부모 -> 자식 순으로 삽입합니다.
 */
export async function importAllData(file: File): Promise<{ ok: boolean; message?: string }> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, message: "올바른 JSON 파일이 아니에요" };
  }
  if (!validateBundle(parsed)) {
    return { ok: false, message: "백업 파일 형식이 올바르지 않아요" };
  }

  const supabase = createClient();

  try {
    // 1) 삭제: 자식 -> 부모 순
    const deleteOrder = [
      "purchases",
      "star_transactions",
      "daily_rewards",
      "task_logs",
      "shop_items",
      "tasks",
      "kids",
    ] as const;
    for (const table of deleteOrder) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
    }

    // 2) 삽입: 부모 -> 자식 순
    const insertOrder: { table: string; rows: unknown[] }[] = [
      { table: "kids", rows: parsed.kids },
      { table: "tasks", rows: parsed.tasks },
      { table: "task_logs", rows: parsed.task_logs },
      { table: "daily_rewards", rows: parsed.daily_rewards },
      { table: "shop_items", rows: parsed.shop_items },
      { table: "star_transactions", rows: parsed.star_transactions },
      { table: "purchases", rows: parsed.purchases },
    ];

    for (const { table, rows } of insertOrder) {
      if (!rows || rows.length === 0) continue;
      const { error } = await supabase.from(table).insert(rows);
      if (error) throw error;
    }

    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "불러오기 중 오류가 발생했어요";
    return { ok: false, message: msg };
  }
}
