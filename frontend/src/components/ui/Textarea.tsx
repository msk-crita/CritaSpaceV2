import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  id,
  name,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId = id ?? name;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-semibold text-text-primary"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error && textareaId ? `${textareaId}-error` : undefined
        }
        className={[
          "min-h-28 w-full resize-y rounded-xl border bg-surface px-4 py-3",
          "text-sm text-text-primary placeholder:text-text-secondary/60",
          "border-border outline-none transition-all duration-200",
          "focus:border-primary focus:ring-2 focus:ring-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500 focus:border-red-500" : "",
          className,
        ].join(" ")}
        {...props}
      />

      {error && (
        <p
          id={textareaId ? `${textareaId}-error` : undefined}
          className="text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
