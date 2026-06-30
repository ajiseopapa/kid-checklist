"use client";

export function StarBadge({
  count,
  size = "md",
}: {
  count: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-sm px-2.5 py-1 gap-1",
    md: "text-base px-3.5 py-1.5 gap-1.5",
    lg: "text-2xl px-5 py-2.5 gap-2",
  };
  return (
    <div
      className={`inline-flex items-center rounded-full font-display ${sizes[size]}`}
      style={{
        background: "linear-gradient(135deg, var(--color-sun), var(--color-sun-deep))",
        color: "var(--color-ink)",
        boxShadow: "0 3px 0 rgba(91,70,54,0.15)",
      }}
    >
      <span>⭐</span>
      <span>{count}</span>
    </div>
  );
}
