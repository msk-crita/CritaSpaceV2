import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-secondary text-text-primary",
  success: "bg-[var(--brand-green-essence)] text-[var(--brand-rainforest)]",
  warning: "bg-[var(--brand-limeade)] text-[var(--brand-rainforest)]",
  danger: "bg-red-100 text-red-700",
  info: "bg-[var(--brand-treetop)]/15 text-text-secondary",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1",
        "text-xs font-semibold leading-none",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
