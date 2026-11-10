import { useMemo, useState } from "react";
import { Building2, Pencil, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { useCompanies } from "./useCompanies";
import CompanyStatusBadge from "./components/CompanyStatusBadge";
import CompanyFormModal from "./components/CompanyFormModal";
import CompanyToolbar, {
  type CompanyStatusFilter,
} from "./components/CompanyToolbar";
import type { Company, CompanyStatus } from "./company.types";
import axios from "axios";

function getApiError(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      "Unable to save the company. Please try again."
    );
  }

  return error instanceof Error
    ? error.message
    : "Unable to save the company. Please try again.";
}

function CompanyPage() {
  const {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
  } = useCompanies();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CompanyStatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const activeCount = companies.filter(
    (company) => company.status === "active",
  ).length;

  const inactiveCount = companies.filter(
    (company) => company.status === "inactive",
  ).length;

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSearch = company.name
        .toLowerCase()
        .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || company.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [companies, search, statusFilter]);

  const handleCreate = () => {
    setEditingCompany(null);
    setSuccessMessage("");
    setModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setSuccessMessage("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingCompany(null);
  };

  const handleSubmit = async (data: {
    name: string;
    status?: CompanyStatus;
  }) => {
    setSaving(true);
    setSuccessMessage("");

    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, data);
        setSuccessMessage("Company updated successfully.");
      } else {
        await createCompany({ name: data.name });
        setSuccessMessage("Company created successfully.");
      }

      setModalOpen(false);
      setEditingCompany(null);
    } catch (submitError) {
      throw new Error(getApiError(submitError), {
        cause: submitError,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Company Management
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Manage the companies sharing your CritaSpace workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-text-secondary">
            Total Companies
          </p>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            {companies.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-text-secondary">
            Active Companies
          </p>
          <p className="mt-2 text-3xl font-bold text-primary">{activeCount}</p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-text-secondary">
            Inactive Companies
          </p>
          <p className="mt-2 text-3xl font-bold text-text-secondary">
            {inactiveCount}
          </p>
        </Card>
      </div>

      <CompanyToolbar
        search={search}
        status={statusFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onCreate={handleCreate}
      />

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-(--brand-greenery)/40 bg-(--brand-green-essence) px-4 py-3 text-sm font-medium text-(--brand-rainforest)"
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            onClick={() => void fetchCompanies()}
            className="shrink-0"
          >
            <RefreshCw size={16} />
            Retry
          </Button>
        </div>
      )}

      <Card padding="none">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-bold text-text-primary">Companies</h3>
            <p className="mt-1 text-xs text-text-secondary">
              {filteredCompanies.length} of {companies.length} companies
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center">
            <Spinner size="lg" label="Loading companies" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Building2 size={26} />}
              title={
                companies.length === 0
                  ? "No companies yet"
                  : "No matching companies"
              }
              description={
                companies.length === 0
                  ? "Create your first company to get started."
                  : "Try changing your search or status filter."
              }
              action={
                companies.length === 0 ? (
                  <Button onClick={handleCreate}>Create Company</Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/40 text-primary">
                        <Building2 size={18} />
                      </span>
                      <span className="font-semibold">{company.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <CompanyStatusBadge status={company.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      className="px-3 py-2"
                      onClick={() => handleEdit(company)}
                      aria-label={`Edit ${company.name}`}
                    >
                      <Pencil size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <CompanyFormModal
        open={modalOpen}
        company={editingCompany}
        loading={saving}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default CompanyPage;
