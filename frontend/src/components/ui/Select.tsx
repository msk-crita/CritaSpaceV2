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
    <div className="flex w-full flex-col gap-1.5">
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
          "w-full rounded-xl border bg-surface px-4 py-3",
          "text-sm text-text-primary outline-none transition-all duration-200",
          "border-border focus:border-primary focus:ring-2 focus:ring-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-500 focus:border-red-500" : "",
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
          className="text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
