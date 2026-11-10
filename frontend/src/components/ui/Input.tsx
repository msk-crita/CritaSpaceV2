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
    <div className="flex w-full flex-col gap-1.5">
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
          "w-full rounded-xl border bg-surface px-4 py-3",
          "text-sm text-text-primary placeholder:text-text-secondary/60",
          "border-border outline-none transition-all duration-200",
          "focus:border-primary focus:ring-2 focus:ring-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
            : "",
          className,
        ].join(" ")}
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        {...props}
      />

      {error && (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          className="text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
