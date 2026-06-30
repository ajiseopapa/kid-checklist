"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Kid, Task } from "@/lib/types";
import { AdminSection, AdminInput, AdminButton, EmptyRow } from "@/components/admin/AdminUI";

const ICON_OPTIONS = ["✅", "🛏️", "🦷", "📚", "🧸", "🍽️", "🚿", "👕", "🐶", "🌱", "🎒", "✏️"];

export function TasksManager({
  tasks,
  kids,
  onChange,
}: {
  tasks: Task[];
  kids: Kid[];
  onChange: () => Promise<void>;
}) {
  const supabase = createClient();
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState(ICON_OPTIONS[0]);
  const [newKidId, setNewKidId] = useState<string>("all");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sorted = [...tasks].sort((a, b) => a.sort_order - b.sort_order);

  const kidLabel = (kidId: string | null) => {
    if (kidId === null) return "전체 공통";
    return kids.find((k) => k.id === kidId)?.name ?? "알 수 없음";
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setBusy(true);
    try {
      const maxOrder = tasks.reduce((m, t) => Math.max(m, t.sort_order), -1);
      const { error } = await supabase.from("tasks").insert({
        title: newTitle.trim(),
        icon: newIcon,
        kid_id: newKidId === "all" ? null : newKidId,
        sort_order: maxOrder + 1,
        active: true,
      });
      if (!error) {
        setNewTitle("");
        setNewIcon(ICON_OPTIONS[0]);
        setNewKidId("all");
        await onChange();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (task: Task) => {
    setBusy(true);
    try {
      await supabase.from("tasks").update({ active: !task.active }).eq("id", task.id);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (task: Task) => {
    setBusy(true);
    try {
      await supabase
        .from("tasks")
        .update({ title: task.title, icon: task.icon, kid_id: task.kid_id })
        .eq("id", task.id);
      setEditingId(null);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await supabase.from("tasks").delete().eq("id", id);
      setConfirmDeleteId(null);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminSection title="일과 관리" icon="📋">
      <div className="flex flex-col gap-3 mb-4 p-3 rounded-2xl" style={{ background: "var(--color-lavender)" }}>
        <p className="text-xs font-bold" style={{ color: "var(--color-ink-soft)" }}>
          새 일과 등록
        </p>
        <AdminInput
          placeholder="할 일 이름 (예: 양치하기)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              onClick={() => setNewIcon(icon)}
              className="press-pop w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{ background: newIcon === icon ? "var(--color-grape)" : "white" }}
            >
              {icon}
            </button>
          ))}
        </div>
        <select
          value={newKidId}
          onChange={(e) => setNewKidId(e.target.value)}
          className="rounded-xl px-3 py-2 outline-none text-sm w-full"
          style={{ background: "white" }}
        >
          <option value="all">👨‍👩‍👧‍👦 전체 아이 공통</option>
          {kids.map((k) => (
            <option key={k.id} value={k.id}>
              {k.avatar} {k.name}만
            </option>
          ))}
        </select>
        <AdminButton onClick={handleAdd} disabled={busy || !newTitle.trim()}>
          + 일과 등록하기
        </AdminButton>
      </div>

      {sorted.length === 0 ? (
        <EmptyRow text="등록된 일과가 없어요" />
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((task) =>
            editingId === task.id ? (
              <EditTaskRow
                key={task.id}
                task={task}
                kids={kids}
                onSave={handleUpdate}
                onCancel={() => setEditingId(null)}
                busy={busy}
              />
            ) : (
              <div
                key={task.id}
                className="flex flex-col gap-2 p-3 rounded-2xl"
                style={{ background: "var(--color-cream-deep)", opacity: task.active ? 1 : 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="text-xl shrink-0">{task.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm truncate">{task.title}</p>
                    <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
                      {kidLabel(task.kid_id)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <AdminButton variant="ghost" onClick={() => handleToggleActive(task)} disabled={busy}>
                    {task.active ? "✅ 사용중" : "⏸ 꺼짐"}
                  </AdminButton>
                  <AdminButton variant="ghost" onClick={() => setEditingId(task.id)}>
                    ✏️ 수정
                  </AdminButton>
                  {confirmDeleteId === task.id ? (
                    <>
                      <AdminButton variant="danger" onClick={() => handleDelete(task.id)} disabled={busy}>
                        정말 삭제
                      </AdminButton>
                      <AdminButton variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                        취소
                      </AdminButton>
                    </>
                  ) : (
                    <AdminButton variant="danger" onClick={() => setConfirmDeleteId(task.id)}>
                      🗑 삭제
                    </AdminButton>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </AdminSection>
  );
}

function EditTaskRow({
  task,
  kids,
  onSave,
  onCancel,
  busy,
}: {
  task: Task;
  kids: Kid[];
  onSave: (task: Task) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [title, setTitle] = useState(task.title);
  const [icon, setIcon] = useState(task.icon);
  const [kidId, setKidId] = useState<string>(task.kid_id ?? "all");

  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl" style={{ background: "var(--color-lavender)" }}>
      <AdminInput value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="flex flex-wrap gap-1.5">
        {ICON_OPTIONS.map((i) => (
          <button
            key={i}
            onClick={() => setIcon(i)}
            className="press-pop w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: icon === i ? "var(--color-grape)" : "white" }}
          >
            {i}
          </button>
        ))}
      </div>
      <select
        value={kidId}
        onChange={(e) => setKidId(e.target.value)}
        className="rounded-xl px-3 py-2 outline-none text-sm w-full"
        style={{ background: "white" }}
      >
        <option value="all">👨‍👩‍👧‍👦 전체 아이 공통</option>
        {kids.map((k) => (
          <option key={k.id} value={k.id}>
            {k.avatar} {k.name}만
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <AdminButton
          onClick={() => onSave({ ...task, title, icon, kid_id: kidId === "all" ? null : kidId })}
          disabled={busy || !title.trim()}
        >
          저장
        </AdminButton>
        <AdminButton variant="ghost" onClick={onCancel}>
          취소
        </AdminButton>
      </div>
    </div>
  );
}
