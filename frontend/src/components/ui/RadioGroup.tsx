interface RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  direction?: "vertical" | "horizontal";
  disabled?: boolean;
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  direction = "vertical",
  disabled = false,
}: RadioGroupProps) {
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-3">
      {label && (
        <legend className="mb-1 text-sm font-semibold text-text-primary">
          {label}
        </legend>
      )}

      <div
        className={[
          "flex gap-4",
          direction === "vertical" ? "flex-col" : "flex-row flex-wrap",
        ].join(" ")}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={[
              "inline-flex items-start gap-3",
              option.disabled || disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer",
            ].join(" ")}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="mt-0.5 h-4 w-4 accent-primary focus:ring-2 focus:ring-primary/20"
            />

            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text-primary">
                {option.label}
              </span>

              {option.description && (
                <span className="text-xs text-text-secondary">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
