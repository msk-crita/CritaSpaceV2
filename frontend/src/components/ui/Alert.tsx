import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

export type AlertVariant = "info" | "success" | "warning" | "danger";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const styles: Record<AlertVariant, string> = {
  info: [
    "border-info/25 bg-info/10 text-info",
    "shadow-[3px_3px_8px_rgba(3,63,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.35)]",
    "dark:shadow-[3px_3px_8px_rgba(0,0,0,0.14)]",
  ].join(" "),

  success: [
    "border-success/25 bg-success/10 text-success",
    "shadow-[3px_3px_8px_rgba(3,63,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.35)]",
    "dark:shadow-[3px_3px_8px_rgba(0,0,0,0.14)]",
  ].join(" "),

  warning: [
    "border-warning/25 bg-warning/10 text-warning",
    "shadow-[3px_3px_8px_rgba(120,100,20,0.06)]",
    "dark:shadow-[3px_3px_8px_rgba(0,0,0,0.14)]",
  ].join(" "),

  danger: [
    "border-danger/25 bg-danger/10 text-danger",
    "shadow-[3px_3px_8px_rgba(120,30,30,0.06)]",
    "dark:shadow-[3px_3px_8px_rgba(0,0,0,0.14)]",
  ].join(" "),
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
};

function Alert({
  variant = "info",
  title,
  children,
  className = "",
}: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={[
        "flex gap-3 rounded-xl border p-4",
        styles[variant],
        className,
      ].join(" ")}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />

      <div className="min-w-0">
        {title && (
          <p className="mb-1 font-semibold text-text-primary">{title}</p>
        )}

        <div className="text-sm text-text-primary">{children}</div>
      </div>
    </div>
  );
}

export default Alert;
