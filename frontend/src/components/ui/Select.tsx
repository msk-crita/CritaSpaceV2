import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder = "Select an option",
  id,
  name,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id ?? name;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-semibold text-text-primary"
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error && selectId ? `${selectId}-error` : undefined}
        className={[
          // Shape and surface
          "w-full rounded-xl border bg-surface px-4 py-3",
          "text-sm text-text-primary",

          // Recessed Claymorphism
          "border-border",
          "shadow-[inset_3px_3px_7px_rgba(3,63,45,0.08),inset_-3px_-3px_7px_rgba(255,255,255,0.65)]",
          "dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.2),inset_-2px_-2px_6px_rgba(255,255,255,0.025)]",

          // Focus
          "outline-none transition-all duration-200",
          "focus:border-primary focus:ring-2 focus:ring-primary/15",

          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",

          // Error
          error ? "border-danger focus:border-danger" : "",

          className,
        ].join(" ")}
        {...props}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p
          id={selectId ? `${selectId}-error` : undefined}
          className="text-xs text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}
