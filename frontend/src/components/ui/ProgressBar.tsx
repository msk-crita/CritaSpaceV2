interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const percentage =
    max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          {label && (
            <span className="font-medium text-text-primary">{label}</span>
          )}

          {showValue && (
            <span className="font-semibold tabular-nums text-text-secondary">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-label={label || "Progress"}
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={[
          "overflow-hidden rounded-full border border-border/70",
          "bg-surface-secondary",
          "shadow-[inset_2px_2px_5px_rgba(3,63,45,0.09),inset_-1px_-1px_3px_rgba(255,255,255,0.35)]",
          sizes[size],
        ].join(" ")}
      >
        <div
          className={[
            "h-full rounded-full bg-primary",
            "shadow-[1px_1px_4px_rgba(3,63,45,0.18)]",
            "transition-[width] duration-300 ease-out",
            sizes[size],
          ].join(" ")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
