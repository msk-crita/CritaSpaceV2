interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-text-primary">{label}</span>

        {description && (
          <span className="text-xs text-text-secondary">{description}</span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full",
          "border border-border/70",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-primary focus-visible:ring-offset-2",
          checked
            ? "bg-primary shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15)]"
            : "bg-surface-secondary shadow-[inset_2px_2px_5px_rgba(3,63,45,0.12)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 rounded-full",
            "border border-border/40 bg-surface-elevated",
            "shadow-[2px_2px_5px_rgba(0,0,0,0.16),-1px_-1px_3px_rgba(255,255,255,0.5)]",
            "transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
