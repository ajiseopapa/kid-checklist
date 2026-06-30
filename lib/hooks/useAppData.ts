"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Kid,
  Task,
  TaskLog,
  ShopItem,
  Purchase,
  StarTransaction,
  todayStr,
} from "@/lib/types";

export function useAppData() {
  const supabase = createClient();
  const [kids, setKids] = useState<Kid[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transactions, setTransactions] = useState<StarTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, t, tl, si, p, st] = await Promise.all([
        supabase.from("kids").select("*").order("sort_order"),
        supabase.from("tasks").select("*").order("sort_order"),
        supabase
          .from("task_logs")
          .select("*")
          .gte(
            "log_date",
            new Date(Date.now() - 60 * 24 * 3600 * 1000)
              .toISOString()
              .slice(0, 10)
          ),
        supabase.from("shop_items").select("*").order("sort_order"),
        supabase
          .from("purchases")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("star_transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      if (k.error) throw k.error;
      if (t.error) throw t.error;
      if (tl.error) throw tl.error;
      if (si.error) throw si.error;
      if (p.error) throw p.error;
      if (st.error) throw st.error;

      setKids(k.data ?? []);
      setTasks(t.data ?? []);
      setTaskLogs(tl.data ?? []);
      setShopItems(si.data ?? []);
      setPurchases(p.data ?? []);
      setTransactions(st.data ?? []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "데이터를 불러오지 못했어요";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---------- 체크 토글 + 일일 보상 처리 ----------
  const toggleTask = useCallback(
    async (kidId: string, taskId: string, date: string = todayStr()) => {
      const existing = taskLogs.find(
        (l) => l.kid_id === kidId && l.task_id === taskId && l.log_date === date
      );
      const nextDone = !existing?.done;

      if (existing) {
        const { error } = await supabase
          .from("task_logs")
          .update({ done: nextDone, done_at: nextDone ? new Date().toISOString() : null })
          .eq("id", existing.id);
        if (error) throw error;
        setTaskLogs((prev) =>
          prev.map((l) => (l.id === existing.id ? { ...l, done: nextDone } : l))
        );
      } else {
        const { data, error } = await supabase
          .from("task_logs")
          .insert({
            kid_id: kidId,
            task_id: taskId,
            log_date: date,
            done: nextDone,
            done_at: nextDone ? new Date().toISOString() : null,
          })
          .select()
          .single();
        if (error) throw error;
        setTaskLogs((prev) => [...prev, data]);
      }

      // 그 날의 활성 일과를 전부 체크했는지 확인 -> 별 1개 지급
      const kidTasks = tasks.filter(
        (t) => t.active && (t.kid_id === null || t.kid_id === kidId)
      );
      if (kidTasks.length === 0) return;

      const latestLogs = [...taskLogs];
      // 방금 변경분 반영한 가상 목록
      const idx = latestLogs.findIndex(
        (l) => l.kid_id === kidId && l.task_id === taskId && l.log_date === date
      );
      if (idx >= 0) latestLogs[idx] = { ...latestLogs[idx], done: nextDone };
      else
        latestLogs.push({
          id: "temp",
          kid_id: kidId,
          task_id: taskId,
          log_date: date,
          done: nextDone,
          done_at: null,
          created_at: new Date().toISOString(),
        });

      const allDone = kidTasks.every((t) =>
        latestLogs.some(
          (l) => l.kid_id === kidId && l.task_id === t.id && l.log_date === date && l.done
        )
      );

      const { data: existingReward } = await supabase
        .from("daily_rewards")
        .select("*")
        .eq("kid_id", kidId)
        .eq("reward_date", date)
        .maybeSingle();

      if (allDone && !existingReward) {
        // 별 지급
        const { error: rewardErr } = await supabase
          .from("daily_rewards")
          .insert({ kid_id: kidId, reward_date: date, stars_awarded: 1 });
        if (!rewardErr) {
          await addStars(kidId, 1, "daily_complete", "하루 일과 완료");
        }
        return "completed";
      } else if (!allDone && existingReward) {
        // 체크 해제로 미완료 상태가 됐다면 지급 취소
        await supabase.from("daily_rewards").delete().eq("id", existingReward.id);
        await addStars(kidId, -1, "manual_adjust", "일과 미완료로 별 회수");
      }
      return "ok";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supabase, taskLogs, tasks]
  );

  // ---------- 별 적립/차감 (원장 기록 + 잔액 갱신) ----------
  const addStars = useCallback(
    async (
      kidId: string,
      amount: number,
      reason: StarTransaction["reason"],
      memo?: string
    ) => {
      const { data: tx, error: txErr } = await supabase
        .from("star_transactions")
        .insert({ kid_id: kidId, amount, reason, memo })
        .select()
        .single();
      if (txErr) throw txErr;

      const kid = kids.find((k) => k.id === kidId);
      const newBalance = (kid?.star_balance ?? 0) + amount;
      const { error: kidErr } = await supabase
        .from("kids")
        .update({ star_balance: newBalance })
        .eq("id", kidId);
      if (kidErr) throw kidErr;

      setTransactions((prev) => [tx, ...prev]);
      setKids((prev) =>
        prev.map((k) => (k.id === kidId ? { ...k, star_balance: newBalance } : k))
      );
      return newBalance;
    },
    [supabase, kids]
  );

  // ---------- 상점 구매 ----------
  const purchaseItem = useCallback(
    async (kidId: string, item: ShopItem) => {
      const kid = kids.find((k) => k.id === kidId);
      if (!kid) throw new Error("아이를 찾을 수 없어요");
      if (kid.star_balance < item.price) throw new Error("별이 부족해요");
      if (item.stock !== null && item.stock <= 0) throw new Error("품절된 선물이에요");

      const { data: purchase, error: pErr } = await supabase
        .from("purchases")
        .insert({
          kid_id: kidId,
          shop_item_id: item.id,
          item_name_snapshot: item.name,
          item_icon_snapshot: item.icon,
          price: item.price,
        })
        .select()
        .single();
      if (pErr) throw pErr;

      await addStars(kidId, -item.price, "shop_purchase", item.name);

      if (item.stock !== null) {
        const { error: stockErr } = await supabase
          .from("shop_items")
          .update({ stock: item.stock - 1 })
          .eq("id", item.id);
        if (!stockErr) {
          setShopItems((prev) =>
            prev.map((s) => (s.id === item.id ? { ...s, stock: (s.stock ?? 1) - 1 } : s))
          );
        }
      }

      setPurchases((prev) => [purchase, ...prev]);
      return purchase;
    },
    [supabase, kids, addStars]
  );

  return {
    kids,
    tasks,
    taskLogs,
    shopItems,
    purchases,
    transactions,
    loading,
    error,
    reload: loadAll,
    toggleTask,
    addStars,
    purchaseItem,
    setKids,
    setTasks,
    setShopItems,
  };
}
