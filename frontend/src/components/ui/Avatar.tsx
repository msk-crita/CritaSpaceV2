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
        "bg-accent text-accent-foreground font-semibold",
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
