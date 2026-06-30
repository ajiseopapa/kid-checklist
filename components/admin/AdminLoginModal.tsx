"use client";

import { useState } from "react";
import { verifyAdminPassword } from "@/lib/actions/admin";

export function AdminLoginModal({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      const ok = await verifyAdminPassword(password);
      if (ok) {
        onSuccess();
      } else {
        setError("비밀번호가 올바르지 않아요");
        setPassword("");
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <form
        onSubmit={handleSubmit}
        className="blob-card p-6 w-full max-w-sm animate-pop-in"
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🔐</div>
          <p className="font-display text-lg">부모님 모드</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-ink-soft)" }}>
            비밀번호를 입력해주세요
          </p>
        </div>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full text-center text-2xl tracking-widest rounded-2xl py-3 mb-3 outline-none"
          style={{ background: "var(--color-cream-deep)" }}
          placeholder="••••"
        />
        {error && (
          <p className="text-sm text-center mb-3 animate-wiggle" style={{ color: "#D9534F" }}>
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="press-pop flex-1 rounded-full py-2.5 font-display text-sm"
            style={{ background: "var(--color-cream-deep)" }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={checking || !password}
            className="press-pop flex-1 rounded-full py-2.5 font-display text-sm text-white"
            style={{
              background: "linear-gradient(135deg, var(--color-grape), var(--color-grape-deep))",
              opacity: checking || !password ? 0.6 : 1,
            }}
          >
            {checking ? "확인 중..." : "입장하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
