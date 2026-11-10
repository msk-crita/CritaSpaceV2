interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-[3px]",
  lg: "h-10 w-10 border-4",
};

export function Spinner({
  size = "md",
  label = "Loading...",
  className = "",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <span
        className={[
          "animate-spin rounded-full",
          "border-primary/20 border-t-primary",
          "shadow-[2px_2px_5px_rgba(3,63,45,0.08)]",
          sizeStyles[size],
        ].join(" ")}
      />

      <span className="sr-only">{label}</span>
    </div>
  );
}
