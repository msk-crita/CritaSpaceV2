import { useEffect } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A12]/50 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={[
          "w-full overflow-hidden rounded-[1.75rem]",
          "border border-border",
          "bg-surface-elevated",
          "shadow-[0_24px_65px_rgba(3,63,45,0.18),inset_0_1px_0_rgba(255,255,255,0.8)]",
          "dark:shadow-[0_24px_65px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.045)]",
          sizeStyles[size],
        ].join(" ")}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border bg-surface px-7 py-6">
          <div>
            <h2
              id="modal-title"
              className="text-lg font-bold text-text-primary"
            >
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-accent/30 hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </header>

        <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
      </section>
    </div>
  );
}
