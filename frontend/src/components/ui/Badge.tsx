import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: [
    "border border-border",
    "bg-surface-secondary text-text-primary",
    "shadow-[2px_2px_5px_rgba(3,63,45,0.07),-2px_-2px_5px_rgba(255,255,255,0.55)]",
    "dark:shadow-[2px_2px_5px_rgba(0,0,0,0.16),-1px_-1px_4px_rgba(255,255,255,0.025)]",
  ].join(" "),

  success: [
    "border border-success/20",
    "bg-success-soft text-success",
    "shadow-[2px_2px_5px_rgba(3,63,45,0.06)]",
    "dark:shadow-[2px_2px_5px_rgba(0,0,0,0.15)]",
  ].join(" "),

  warning: [
    "border border-warning/20",
    "bg-warning-soft text-warning",
    "shadow-[2px_2px_5px_rgba(120,100,20,0.07)]",
    "dark:shadow-[2px_2px_5px_rgba(0,0,0,0.15)]",
  ].join(" "),

  danger: [
    "border border-danger/20",
    "bg-danger-soft text-danger",
    "shadow-[2px_2px_5px_rgba(120,30,30,0.07)]",
    "dark:shadow-[2px_2px_5px_rgba(0,0,0,0.15)]",
  ].join(" "),

  info: [
    "border border-info/20",
    "bg-info-soft text-info",
    "shadow-[2px_2px_5px_rgba(3,63,45,0.06)]",
    "dark:shadow-[2px_2px_5px_rgba(0,0,0,0.15)]",
  ].join(" "),
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
        "transition-colors duration-200",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
