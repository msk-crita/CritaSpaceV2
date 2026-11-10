interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedStyles = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({
  className = "",
  width,
  height,
  rounded = "md",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse",
        "border border-border/30",
        "bg-surface-secondary/60",
        "shadow-[inset_2px_2px_5px_rgba(3,63,45,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.35)]",
        "dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15)]",
        roundedStyles[rounded],
        className,
      ].join(" ")}
      style={{ width, height }}
    />
  );
}
