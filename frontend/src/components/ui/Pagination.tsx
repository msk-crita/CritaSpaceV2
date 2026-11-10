import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        size="md"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
        Previous
      </Button>

      <span className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary shadow-[inset_2px_2px_4px_rgba(3,63,45,0.05)]">
        Page <span className="font-bold text-text-primary">{currentPage}</span>{" "}
        of <span className="font-bold text-text-primary">{totalPages}</span>
      </span>

      <Button
        variant="outline"
        size="md"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
