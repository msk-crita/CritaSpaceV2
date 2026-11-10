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
        "rounded-2xl border border-dashed border-border",
        "px-6 py-12 text-center",
        className,
      ].join(" ")}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/40 text-primary">
          {icon}
        </div>
      )}

      <h3 className="text-base font-bold text-text-primary">{title}</h3>

      {description && (
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
