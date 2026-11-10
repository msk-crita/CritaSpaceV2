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
  info: "border-[var(--brand-treetop)]/30 bg-[var(--brand-treetop)]/10 text-text-primary",
  success:
    "border-[var(--brand-greenery)]/40 bg-[var(--brand-green-essence)] text-[var(--brand-rainforest)]",
  warning:
    "border-[var(--brand-limeade)] bg-[var(--brand-limeade)]/20 text-[var(--brand-rainforest)]",
  danger: "border-red-300 bg-red-50 text-red-800",
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
      className={`flex gap-3 rounded-xl border p-4 ${styles[variant]} ${className}`}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />

      <div className="min-w-0">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

export default Alert;
