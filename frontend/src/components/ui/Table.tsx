import type { HTMLAttributes, TableHTMLAttributes } from "react";

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export function Table({
  children,
  className = "",
  containerClassName = "",
  ...props
}: TableProps) {
  return (
    <div
      className={[
        "w-full overflow-x-auto rounded-2xl border border-border",
        "bg-surface",
        "shadow-[4px_4px_12px_rgba(3,63,45,0.07),-3px_-3px_9px_rgba(232,235,213,0.65)]",
        "dark:shadow-[4px_4px_12px_rgba(0,0,0,0.20),-3px_-3px_9px_rgba(127,165,63,0.04)]",
        containerClassName,
      ].join(" ")}
    >
      <table
        className={`w-full border-collapse text-left text-sm ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className="bg-surface-secondary/50 text-text-secondary" {...props}>
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className="divide-y divide-border" {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={[
        "transition-colors duration-150",
        "hover:bg-surface-secondary/40",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={[
        "px-5 py-3 text-xs font-bold uppercase tracking-wide",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-5 py-4 text-text-primary ${className}`} {...props}>
      {children}
    </td>
  );
}
