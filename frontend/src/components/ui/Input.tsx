import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-text-primary"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={[
          // Shape and surface
          "w-full rounded-xl border px-4 py-3",
          "bg-surface text-sm text-text-primary",
          "placeholder:text-text-secondary/60",

          // Recessed Claymorphism effect
          "border-border",
          "shadow-[inset_3px_3px_7px_rgba(3,63,45,0.08),inset_-3px_-3px_7px_rgba(255,255,255,0.65)]",
          "dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.2),inset_-2px_-2px_6px_rgba(255,255,255,0.025)]",

          // Focus
          "outline-none transition-all duration-200",
          "focus:border-primary",
          "focus:ring-2 focus:ring-primary/15",
          "focus:shadow-[inset_2px_2px_5px_rgba(3,63,45,0.06),0_0_0_3px_var(--focus-ring)]",

          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",

          // Error
          error ? "border-danger focus:border-danger focus:ring-danger/15" : "",

          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        {...props}
      />

      {error && (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          className="text-xs text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}
