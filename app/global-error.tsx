"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          background: "#FFF8EF",
          fontFamily: "sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px" }}>😵</div>
        <p style={{ fontWeight: "bold", fontSize: "18px" }}>
          앱을 불러오는 중 문제가 생겼어요
        </p>
        <pre
          style={{
            fontSize: "12px",
            background: "white",
            padding: "12px",
            borderRadius: "12px",
            maxWidth: "480px",
            overflow: "auto",
            textAlign: "left",
            whiteSpace: "pre-wrap",
          }}
        >
          {error.message}
          {error.digest ? `\n(digest: ${error.digest})` : ""}
        </pre>
        <button
          onClick={() => reset()}
          style={{
            background: "white",
            borderRadius: "999px",
            padding: "8px 16px",
            border: "none",
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
