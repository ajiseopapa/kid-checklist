"use client";

import { useRef, useState } from "react";
import { exportAllData, downloadJson, importAllData } from "@/lib/data-transfer";
import { AdminSection, AdminButton } from "@/components/admin/AdminUI";

export function DataManager({ onReload }: { onReload: () => Promise<void> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [confirmImport, setConfirmImport] = useState<File | null>(null);

  const handleExport = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const bundle = await exportAllData();
      downloadJson(bundle);
      setMessage({ type: "ok", text: "백업 파일을 내려받았어요!" });
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "내보내기에 실패했어요" });
    } finally {
      setBusy(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setConfirmImport(file);
    e.target.value = "";
  };

  const handleConfirmImport = async () => {
    if (!confirmImport) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await importAllData(confirmImport);
      if (result.ok) {
        setMessage({ type: "ok", text: "데이터를 성공적으로 불러왔어요!" });
        await onReload();
      } else {
        setMessage({ type: "error", text: result.message ?? "불러오기에 실패했어요" });
      }
    } finally {
      setBusy(false);
      setConfirmImport(null);
    }
  };

  return (
    <AdminSection title="데이터 백업 / 복원" icon="💾">
      <p className="text-sm mb-4" style={{ color: "var(--color-ink-soft)" }}>
        모든 아이, 일과, 별, 상점, 구매 기록을 파일로 저장하거나 불러올 수 있어요.
      </p>

      <div className="flex flex-col gap-2 mb-3">
        <AdminButton onClick={handleExport} disabled={busy}>
          ⬇️ 내보내기 (백업 파일 받기)
        </AdminButton>
        <AdminButton variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={busy}>
          ⬆️ 불러오기 (백업 파일 복원)
        </AdminButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {message && (
        <p
          className="text-sm text-center font-display animate-pop-in"
          style={{ color: message.type === "ok" ? "var(--color-mint-deep)" : "#D9534F" }}
        >
          {message.text}
        </p>
      )}

      {confirmImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="blob-card p-6 w-full max-w-sm animate-pop-in">
            <p className="font-display text-center mb-2">⚠️ 정말 불러올까요?</p>
            <p className="text-sm text-center mb-4" style={{ color: "var(--color-ink-soft)" }}>
              현재 저장된 모든 데이터가 백업 파일 내용으로
              <br />
              완전히 바뀌어요. 되돌릴 수 없어요!
            </p>
            <div className="flex gap-2">
              <AdminButton variant="ghost" className="flex-1" onClick={() => setConfirmImport(null)}>
                취소
              </AdminButton>
              <AdminButton variant="danger" className="flex-1" onClick={handleConfirmImport} disabled={busy}>
                {busy ? "불러오는 중..." : "불러오기"}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </AdminSection>
  );
}
