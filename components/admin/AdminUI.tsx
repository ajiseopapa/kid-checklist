"use client";

export function AdminSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="blob-card p-5 mb-5">
      <p className="font-display text-base mb-4">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

export function AdminInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={`rounded-xl px-3 py-2 outline-none text-sm w-full ${props.className ?? ""}`}
      style={{ background: "var(--color-cream-deep)", ...props.style }}
    />
  );
}

export function AdminButton({
  children,
  variant = "primary",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger" | "ghost";
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, var(--color-grape), var(--color-grape-deep))",
      color: "white",
    },
    danger: {
      background: "linear-gradient(135deg, #FF9D9D, #E97A7A)",
      color: "white",
    },
    ghost: {
      background: "var(--color-cream-deep)",
      color: "var(--color-ink)",
    },
  };
  return (
    <button
      {...rest}
      className={`press-pop rounded-full px-4 py-2 text-sm font-display whitespace-nowrap ${rest.className ?? ""}`}
      style={{ ...styles[variant], ...rest.style }}
    >
      {children}
    </button>
  );
}

export function EmptyRow({ text }: { text: string }) {
  return (
    <p className="text-sm text-center py-4" style={{ color: "var(--color-ink-soft)" }}>
      {text}
    </p>
  );
}
