import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export function Card({
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        // Shape and brand surface
        "relative overflow-hidden rounded-3xl",
        "border border-border/70",
        "bg-surface",

        // Brand-aligned Claymorphism depth
        "shadow-[6px_6px_16px_rgba(3,63,45,0.09),-6px_-6px_16px_rgba(232,235,213,0.75)]",
        "dark:shadow-[7px_7px_18px_rgba(0,0,0,0.24),-4px_-4px_14px_rgba(127,165,63,0.06)]",

        // Subtle inner highlight
        "before:pointer-events-none before:absolute before:inset-0",
        "before:rounded-[inherit] before:border before:border-border/40",

        // Interaction
        "transition-[box-shadow,transform] duration-200",
        "hover:-translate-y-0.5",
        "hover:shadow-[8px_8px_20px_rgba(3,63,45,0.12),-7px_-7px_18px_rgba(232,235,213,0.85)]",
        "dark:hover:shadow-[8px_8px_22px_rgba(0,0,0,0.3),-4px_-4px_16px_rgba(127,165,63,0.08)]",

        paddingStyles[padding],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
