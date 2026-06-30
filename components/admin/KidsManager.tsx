"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Kid, AVATAR_OPTIONS, COLOR_OPTIONS } from "@/lib/types";
import { AdminSection, AdminInput, AdminButton, EmptyRow } from "@/components/admin/AdminUI";

export function KidsManager({
  kids,
  onChange,
}: {
  kids: Kid[];
  onChange: () => Promise<void>;
}) {
  const supabase = createClient();
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState(AVATAR_OPTIONS[0]);
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sorted = [...kids].sort((a, b) => a.sort_order - b.sort_order);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const maxOrder = kids.reduce((m, k) => Math.max(m, k.sort_order), -1);
      const { error } = await supabase.from("kids").insert({
        name: newName.trim(),
        avatar: newAvatar,
        color: newColor,
        sort_order: maxOrder + 1,
      });
      if (!error) {
        setNewName("");
        setNewAvatar(AVATAR_OPTIONS[0]);
        setNewColor(COLOR_OPTIONS[0].value);
        await onChange();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (kid: Kid) => {
    setBusy(true);
    try {
      await supabase
        .from("kids")
        .update({ name: kid.name, avatar: kid.avatar, color: kid.color })
        .eq("id", kid.id);
      setEditingId(null);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await supabase.from("kids").delete().eq("id", id);
      setConfirmDeleteId(null);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminSection title="아이 관리" icon="👶">
      <div className="flex flex-col gap-3 mb-4 p-3 rounded-2xl" style={{ background: "var(--color-lavender)" }}>
        <p className="text-xs font-bold" style={{ color: "var(--color-ink-soft)" }}>
          새 아이 등록
        </p>
        <AdminInput
          placeholder="이름"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {AVATAR_OPTIONS.map((a) => (
            <button
              key={a}
              onClick={() => setNewAvatar(a)}
              className="press-pop w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{
                background: newAvatar === a ? "var(--color-grape)" : "white",
              }}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => setNewColor(c.value)}
              className="press-pop w-9 h-9 rounded-full border-2"
              style={{
                background: c.value,
                borderColor: newColor === c.value ? "var(--color-ink)" : "transparent",
              }}
              title={c.name}
            />
          ))}
        </div>
        <AdminButton onClick={handleAdd} disabled={busy || !newName.trim()}>
          + 아이 등록하기
        </AdminButton>
      </div>

      {sorted.length === 0 ? (
        <EmptyRow text="등록된 아이가 없어요" />
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((kid) =>
            editingId === kid.id ? (
              <EditKidRow
                key={kid.id}
                kid={kid}
                onSave={handleUpdate}
                onCancel={() => setEditingId(null)}
                busy={busy}
              />
            ) : (
              <div
                key={kid.id}
                className="flex flex-col gap-2 p-3 rounded-2xl"
                style={{ background: "var(--color-cream-deep)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                    style={{ background: kid.color + "66" }}
                  >
                    {kid.avatar}
                  </div>
                  <span className="flex-1 font-display text-sm">{kid.name}</span>
                  <span className="text-xs shrink-0" style={{ color: "var(--color-ink-soft)" }}>
                    ⭐ {kid.star_balance}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <AdminButton variant="ghost" onClick={() => setEditingId(kid.id)}>
                    ✏️ 수정
                  </AdminButton>
                  {confirmDeleteId === kid.id ? (
                    <>
                      <AdminButton variant="danger" onClick={() => handleDelete(kid.id)} disabled={busy}>
                        정말 삭제
                      </AdminButton>
                      <AdminButton variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                        취소
                      </AdminButton>
                    </>
                  ) : (
                    <AdminButton variant="danger" onClick={() => setConfirmDeleteId(kid.id)}>
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

function EditKidRow({
  kid,
  onSave,
  onCancel,
  busy,
}: {
  kid: Kid;
  onSave: (kid: Kid) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [name, setName] = useState(kid.name);
  const [avatar, setAvatar] = useState(kid.avatar);
  const [color, setColor] = useState(kid.color);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl" style={{ background: "var(--color-lavender)" }}>
      <AdminInput value={name} onChange={(e) => setName(e.target.value)} />
      <div className="flex flex-wrap gap-1.5">
        {AVATAR_OPTIONS.map((a) => (
          <button
            key={a}
            onClick={() => setAvatar(a)}
            className="press-pop w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: avatar === a ? "var(--color-grape)" : "white" }}
          >
            {a}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c.value}
            onClick={() => setColor(c.value)}
            className="press-pop w-8 h-8 rounded-full border-2"
            style={{ background: c.value, borderColor: color === c.value ? "var(--color-ink)" : "transparent" }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <AdminButton onClick={() => onSave({ ...kid, name, avatar, color })} disabled={busy || !name.trim()}>
          저장
        </AdminButton>
        <AdminButton variant="ghost" onClick={onCancel}>
          취소
        </AdminButton>
      </div>
    </div>
  );
}
