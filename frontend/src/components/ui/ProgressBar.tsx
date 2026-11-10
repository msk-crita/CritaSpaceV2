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
            <span className="text-text-secondary">
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
        className={`overflow-hidden rounded-full bg-surface-secondary ${sizes[size]}`}
      >
        <div
          className={`h-full rounded-full bg-primary transition-[width] duration-300 ${sizes[size]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
