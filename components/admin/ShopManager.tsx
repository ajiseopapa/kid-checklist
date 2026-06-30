"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShopItem } from "@/lib/types";
import { AdminSection, AdminInput, AdminButton, EmptyRow } from "@/components/admin/AdminUI";

const ICON_OPTIONS = ["🎁", "🍦", "🍫", "📺", "🎮", "🚗", "🧸", "🎨", "📖", "🍕", "🎟️", "⏰"];

export function ShopManager({
  shopItems,
  onChange,
}: {
  shopItems: ShopItem[];
  onChange: () => Promise<void>;
}) {
  const supabase = createClient();
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(ICON_OPTIONS[0]);
  const [newPrice, setNewPrice] = useState(5);
  const [newStock, setNewStock] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sorted = [...shopItems].sort((a, b) => a.sort_order - b.sort_order);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const maxOrder = shopItems.reduce((m, s) => Math.max(m, s.sort_order), -1);
      const { error } = await supabase.from("shop_items").insert({
        name: newName.trim(),
        icon: newIcon,
        price: newPrice,
        stock: newStock === "" ? null : parseInt(newStock, 10),
        sort_order: maxOrder + 1,
        active: true,
      });
      if (!error) {
        setNewName("");
        setNewIcon(ICON_OPTIONS[0]);
        setNewPrice(5);
        setNewStock("");
        await onChange();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (item: ShopItem) => {
    setBusy(true);
    try {
      await supabase.from("shop_items").update({ active: !item.active }).eq("id", item.id);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (item: ShopItem) => {
    setBusy(true);
    try {
      await supabase
        .from("shop_items")
        .update({ name: item.name, icon: item.icon, price: item.price, stock: item.stock })
        .eq("id", item.id);
      setEditingId(null);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await supabase.from("shop_items").delete().eq("id", id);
      setConfirmDeleteId(null);
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminSection title="선물 상점 관리" icon="🏪">
      <div className="flex flex-col gap-3 mb-4 p-3 rounded-2xl" style={{ background: "var(--color-lavender)" }}>
        <p className="text-xs font-bold" style={{ color: "var(--color-ink-soft)" }}>
          새 선물 등록
        </p>
        <AdminInput
          placeholder="선물 이름 (예: 아이스크림)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
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
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
              가격 (⭐)
            </label>
            <AdminInput
              type="number"
              min={1}
              value={newPrice}
              onChange={(e) => setNewPrice(parseInt(e.target.value, 10) || 1)}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
              재고 (빈칸=무제한)
            </label>
            <AdminInput
              type="number"
              min={0}
              placeholder="무제한"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
            />
          </div>
        </div>
        <AdminButton onClick={handleAdd} disabled={busy || !newName.trim()}>
          + 선물 등록하기
        </AdminButton>
      </div>

      {sorted.length === 0 ? (
        <EmptyRow text="등록된 선물이 없어요" />
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((item) =>
            editingId === item.id ? (
              <EditShopItemRow
                key={item.id}
                item={item}
                onSave={handleUpdate}
                onCancel={() => setEditingId(null)}
                busy={busy}
              />
            ) : (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-3 rounded-2xl"
                style={{ background: "var(--color-cream-deep)", opacity: item.active ? 1 : 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="text-xl shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm truncate">{item.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
                      ⭐{item.price} · {item.stock === null ? "무제한" : `재고 ${item.stock}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <AdminButton variant="ghost" onClick={() => handleToggleActive(item)} disabled={busy}>
                    {item.active ? "✅ 판매중" : "⏸ 숨김"}
                  </AdminButton>
                  <AdminButton variant="ghost" onClick={() => setEditingId(item.id)}>
                    ✏️ 수정
                  </AdminButton>
                  {confirmDeleteId === item.id ? (
                    <>
                      <AdminButton variant="danger" onClick={() => handleDelete(item.id)} disabled={busy}>
                        정말 삭제
                      </AdminButton>
                      <AdminButton variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                        취소
                      </AdminButton>
                    </>
                  ) : (
                    <AdminButton variant="danger" onClick={() => setConfirmDeleteId(item.id)}>
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

function EditShopItemRow({
  item,
  onSave,
  onCancel,
  busy,
}: {
  item: ShopItem;
  onSave: (item: ShopItem) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [name, setName] = useState(item.name);
  const [icon, setIcon] = useState(item.icon);
  const [price, setPrice] = useState(item.price);
  const [stock, setStock] = useState<string>(item.stock === null ? "" : String(item.stock));

  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl" style={{ background: "var(--color-lavender)" }}>
      <AdminInput value={name} onChange={(e) => setName(e.target.value)} />
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
      <div className="flex gap-2">
        <AdminInput
          type="number"
          min={1}
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value, 10) || 1)}
        />
        <AdminInput
          type="number"
          min={0}
          placeholder="무제한"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <AdminButton
          onClick={() =>
            onSave({ ...item, name, icon, price, stock: stock === "" ? null : parseInt(stock, 10) })
          }
          disabled={busy || !name.trim()}
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
