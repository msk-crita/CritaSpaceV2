interface DividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  className = "",
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={[
        "shrink-0",
        "bg-linear-to-r from-transparent via-border to-transparent",
        orientation === "horizontal"
          ? "h-px w-full"
          : "h-full w-px bg-linear-to-b",
        className,
      ].join(" ")}
    />
  );
}
