import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

const positionStyles = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "left-1/2 top-full mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}

      <span
        role="tooltip"
        className={[
          "pointer-events-none absolute z-50 whitespace-nowrap",
          "rounded-lg bg-(--brand-rainforest) px-3 py-1.5",
          "text-xs font-medium text-(--brand-green-essence)",
          "opacity-0 shadow-lg transition-opacity duration-150",
          "group-hover:opacity-100 group-focus-within:opacity-100",
          positionStyles[position],
        ].join(" ")}
      >
        {content}
      </span>
    </div>
  );
}
