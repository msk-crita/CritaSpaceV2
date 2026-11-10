import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
}

export function DropdownMenu({
  trigger,
  items,
  align = "right",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className={[
          "inline-flex items-center gap-2 rounded-xl",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-primary focus-visible:ring-offset-2",
        ].join(" ")}
      >
        {trigger}
        <ChevronDown
          size={14}
          className={[
            "transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={[
            "absolute top-full z-40 mt-2 min-w-48",
            "rounded-xl border border-border bg-surface p-1.5",
            "shadow-[6px_6px_16px_rgba(3,63,45,0.12),-3px_-3px_10px_rgba(255,255,255,0.5)]",
            "dark:shadow-[6px_6px_16px_rgba(0,0,0,0.3),-2px_-2px_8px_rgba(255,255,255,0.025)]",
            "animate-in fade-in slide-in-from-top-1 duration-150",
            align === "right" ? "right-0" : "left-0",
          ].join(" ")}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={[
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5",
                "text-left text-sm font-medium transition-all duration-150",
                item.danger
                  ? "text-danger hover:bg-danger/10"
                  : "text-text-primary hover:bg-surface-secondary",
                "active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
