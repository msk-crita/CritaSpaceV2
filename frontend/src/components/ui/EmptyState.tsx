import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center",
        "rounded-2xl border border-border/80",
        "bg-surface px-6 py-12 text-center",
        "shadow-[5px_5px_12px_rgba(3,63,45,0.06),-4px_-4px_10px_rgba(255,255,255,0.55)]",
        "dark:shadow-[5px_5px_12px_rgba(0,0,0,0.16),-3px_-3px_8px_rgba(255,255,255,0.025)]",
        className,
      ].join(" ")}
    >
      {icon && (
        <div
          className={[
            "mb-5 flex h-16 w-16 items-center justify-center",
            "rounded-2xl border border-border/70",
            "bg-surface-secondary text-primary",
            "shadow-[inset_2px_2px_5px_rgba(3,63,45,0.07),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]",
            "dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.18),inset_-1px_-1px_4px_rgba(255,255,255,0.025)]",
          ].join(" ")}
        >
          {icon}
        </div>
      )}

      <h3 className="text-base font-bold text-text-primary">{title}</h3>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
