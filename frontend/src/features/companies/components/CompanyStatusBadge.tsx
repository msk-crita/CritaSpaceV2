import { Badge } from "../../../components/ui/Badge";
import type { CompanyStatus } from "../company.types";

interface CompanyStatusBadgeProps {
  status: CompanyStatus;
}

function CompanyStatusBadge({ status }: CompanyStatusBadgeProps) {
  return (
    <Badge variant={status === "active" ? "success" : "danger"}>
      {status === "active" ? "Active" : "Inactive"}
    </Badge>
  );
}

export default CompanyStatusBadge;
