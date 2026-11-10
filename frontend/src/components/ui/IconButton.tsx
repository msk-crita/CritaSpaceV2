import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const variants: Record<IconButtonVariant, string> = {
  primary: [
    "bg-primary text-primary-foreground",
    "shadow-[3px_3px_7px_rgba(3,63,45,0.18),-2px_-2px_6px_rgba(255,255,255,0.35)]",
    "hover:-translate-y-0.5 hover:shadow-[4px_5px_9px_rgba(3,63,45,0.2)]",
    "active:translate-y-0 active:shadow-inner",
    "dark:shadow-[3px_3px_7px_rgba(0,0,0,0.22)]",
  ].join(" "),

  secondary: [
    "border border-border bg-surface-secondary text-text-primary",
    "shadow-[3px_3px_7px_rgba(3,63,45,0.08),-2px_-2px_6px_rgba(255,255,255,0.5)]",
    "hover:-translate-y-0.5 hover:bg-surface",
    "active:translate-y-0 active:shadow-inner",
    "dark:shadow-[3px_3px_7px_rgba(0,0,0,0.18)]",
  ].join(" "),

  ghost: [
    "bg-transparent text-text-primary",
    "hover:bg-surface-secondary",
    "active:bg-surface-muted",
  ].join(" "),

  danger: [
    "border border-danger/20 bg-danger/10 text-danger",
    "shadow-[3px_3px_7px_rgba(120,30,30,0.07)]",
    "hover:-translate-y-0.5 hover:bg-danger/15",
    "active:translate-y-0 active:shadow-inner",
    "dark:shadow-[3px_3px_7px_rgba(0,0,0,0.16)]",
  ].join(" "),
};

const sizes: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-xl",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "disabled:translate-y-0",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    >
      {icon}
    </button>
  );
}

export default IconButton;
