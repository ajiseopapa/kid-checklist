"use client";

import { useState } from "react";
import { changeAdminPassword } from "@/lib/actions/admin";
import { AdminSection, AdminInput, AdminButton } from "@/components/admin/AdminUI";

export function PasswordChanger() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const handleSubmit = async () => {
    setMessage(null);
    if (next !== confirm) {
      setMessage({ type: "error", text: "새 비밀번호가 서로 달라요" });
      return;
    }
    setBusy(true);
    try {
      const result = await changeAdminPassword(current, next);
      if (result.ok) {
        setMessage({ type: "ok", text: "비밀번호가 변경되었어요!" });
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        setMessage({ type: "error", text: result.message ?? "변경에 실패했어요" });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminSection title="비밀번호 변경" icon="🔑">
      <div className="flex flex-col gap-2">
        <AdminInput
          type="password"
          placeholder="현재 비밀번호"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <AdminInput
          type="password"
          placeholder="새 비밀번호 (4자 이상)"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <AdminInput
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {message && (
          <p
            className="text-sm text-center font-display"
            style={{ color: message.type === "ok" ? "var(--color-mint-deep)" : "#D9534F" }}
          >
            {message.text}
          </p>
        )}
        <AdminButton
          onClick={handleSubmit}
          disabled={busy || !current || !next || !confirm}
        >
          변경하기
        </AdminButton>
      </div>
    </AdminSection>
  );
}
