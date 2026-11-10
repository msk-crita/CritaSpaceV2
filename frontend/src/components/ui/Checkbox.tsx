import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  description?: string;
}

export function Checkbox({
  label,
  description,
  className = "",
  id,
  ...props
}: CheckboxProps) {
  const checkboxId = id ?? props.name;

  return (
    <label
      htmlFor={checkboxId}
      className={[
        "inline-flex items-start gap-3",
        props.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <input
        {...props}
        id={checkboxId}
        type="checkbox"
        className={[
          "mt-0.5 h-4 w-4 shrink-0 rounded border-border",
          "accent-primary",
          "shadow-[1px_1px_3px_rgba(3,63,45,0.1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
          "disabled:cursor-not-allowed",
          className,
        ].join(" ")}
      />

      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-text-primary">{label}</span>

        {description && (
          <span className="text-xs leading-relaxed text-text-secondary">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
