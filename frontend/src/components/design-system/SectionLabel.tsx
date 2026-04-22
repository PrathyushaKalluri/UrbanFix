import type { ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
  variant?: "default" | "blue" | "mono";
  className?: string;
};

export function SectionLabel({
  children,
  variant = "default",
  className = "",
}: SectionLabelProps) {
  const variantClasses = {
    default:
      "text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500",
    blue: "text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-700",
    mono: "font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase",
  };

  return <p className={`${variantClasses[variant]} ${className}`}>{children}</p>;
}
