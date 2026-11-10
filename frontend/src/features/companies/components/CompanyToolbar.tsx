import { Plus, Search } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type { CompanyStatus } from "../company.types";

export type CompanyStatusFilter = "all" | CompanyStatus;

interface CompanyToolbarProps {
  search: string;
  status: CompanyStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CompanyStatusFilter) => void;
  onCreate: () => void;
}

function CompanyToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onCreate,
}: CompanyToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <Input
            aria-label="Search companies"
            placeholder="Search companies..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-10"
          />
        </div>

        <select
          aria-label="Filter companies by status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as CompanyStatusFilter)
          }
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <Button onClick={onCreate} className="w-full sm:w-auto">
        <Plus size={18} />
        Add Company
      </Button>
    </div>
  );
}

export default CompanyToolbar;
