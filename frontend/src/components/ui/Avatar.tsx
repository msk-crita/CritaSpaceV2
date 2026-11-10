interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function Avatar({
  name,
  src,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = getInitials(name) || "?";

  return (
    <div
      role="img"
      aria-label={name || "User avatar"}
      className={[
        "relative inline-flex shrink-0 items-center justify-center",
        "overflow-hidden rounded-full",
        "border border-border/70",
        "bg-accent text-accent-foreground font-semibold",
        "shadow-[3px_3px_7px_rgba(3,63,45,0.12),-2px_-2px_6px_rgba(255,255,255,0.6)]",
        "dark:shadow-[3px_3px_7px_rgba(0,0,0,0.2),-1px_-1px_4px_rgba(255,255,255,0.025)]",
        sizeStyles[size],
        className,
      ].join(" ")}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
