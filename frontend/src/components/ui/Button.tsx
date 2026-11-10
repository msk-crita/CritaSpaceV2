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

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-[0.01em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-100 disabled:bg-[var(--brand-treetop)] disabled:text-white disabled:shadow-none active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand-rainforest)] text-white shadow-[0_4px_12px_rgba(3,63,45,0.16)] hover:bg-[var(--brand-treetop)] hover:shadow-[0_6px_16px_rgba(3,63,45,0.2)] hover:-translate-y-0.5 active:translate-y-0",

  secondary:
    "bg-[var(--brand-green-essence)] text-[var(--brand-rainforest)] border border-[var(--border-color)] shadow-sm hover:bg-[var(--surface-secondary)]",

  outline:
    "border border-[var(--border-strong)] bg-transparent text-[var(--text-primary)] hover:border-[var(--brand-treetop)] hover:bg-[var(--surface-secondary)]",

  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]",

  danger: "bg-[var(--danger)] text-white shadow-sm hover:brightness-95",
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
