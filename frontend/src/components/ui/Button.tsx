import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const baseStyles = [
  "inline-flex items-center justify-center gap-2",
  "rounded-xl font-semibold tracking-[0.01em]",
  "transition-all duration-200 ease-out",
  "focus-visible:outline-none",
  "focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]",
  "disabled:pointer-events-none disabled:opacity-60",
  "active:scale-[0.98] active:translate-y-0",
].join(" ");

const variants: Record<ButtonVariant, string> = {
  primary: [
    "border border-[var(--brand-treetop)]",
    "bg-[var(--brand-rainforest)] text-white",
    "shadow-[4px_4px_9px_rgba(3,63,45,0.18),-3px_-3px_8px_rgba(255,255,255,0.55)]",
    "dark:shadow-[4px_4px_10px_rgba(0,0,0,0.25),-2px_-2px_7px_rgba(255,255,255,0.035)]",
    "hover:bg-[var(--brand-treetop)]",
    "hover:-translate-y-0.5",
    "hover:shadow-[6px_6px_12px_rgba(3,63,45,0.2),-4px_-4px_9px_rgba(255,255,255,0.6)]",
    "dark:hover:shadow-[6px_6px_13px_rgba(0,0,0,0.3),-3px_-3px_8px_rgba(255,255,255,0.045)]",
    "disabled:shadow-none",
  ].join(" "),

  secondary: [
    "border border-border",
    "bg-surface-secondary text-text-primary",
    "shadow-[4px_4px_9px_rgba(3,63,45,0.09),-3px_-3px_8px_rgba(255,255,255,0.7)]",
    "dark:shadow-[4px_4px_10px_rgba(0,0,0,0.2),-2px_-2px_7px_rgba(255,255,255,0.025)]",
    "hover:-translate-y-0.5 hover:shadow-md",
    "active:shadow-inner",
  ].join(" "),

  outline: [
    "border border-border",
    "bg-surface text-text-primary",
    "shadow-[3px_3px_7px_rgba(3,63,45,0.07),-3px_-3px_7px_rgba(255,255,255,0.65)]",
    "dark:shadow-[3px_3px_8px_rgba(0,0,0,0.18),-2px_-2px_6px_rgba(255,255,255,0.02)]",
    "hover:border-[var(--brand-treetop)]",
    "hover:bg-surface-secondary hover:-translate-y-0.5",
    "active:shadow-inner",
  ].join(" "),

  ghost: [
    "border border-transparent",
    "bg-transparent text-text-secondary",
    "hover:bg-surface-secondary hover:text-text-primary",
    "hover:border-border",
  ].join(" "),

  danger: [
    "border border-[var(--danger)]",
    "bg-[var(--danger)] text-white",
    "shadow-[3px_3px_8px_rgba(120,30,30,0.16)]",
    "hover:brightness-95 hover:-translate-y-0.5",
    "hover:shadow-md",
  ].join(" "),
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={[
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading && (
          <Loader2 size={17} className="animate-spin" aria-hidden="true" />
        )}

        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
