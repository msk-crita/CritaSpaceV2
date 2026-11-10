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
      className="inline-flex cursor-pointer items-start gap-3"
    >
      <input
        {...props}
        id={checkboxId}
        type="checkbox"
        className={[
          "mt-0.5 h-4 w-4 shrink-0 rounded border-border",
          "accent-primary focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        ].join(" ")}
      />

      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-text-primary">{label}</span>

        {description && (
          <span className="text-xs text-text-secondary">{description}</span>
        )}
      </span>
    </label>
  );
}
