import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import type { Company, CompanyStatus } from "../company.types";

interface CompanyFormModalProps {
  open: boolean;
  company: Company | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; status?: CompanyStatus }) => Promise<void>;
}

function CompanyFormModal({
  open,
  company,
  loading,
  onClose,
  onSubmit,
}: CompanyFormModalProps) {
  if (!open) return null;

  return (
    <CompanyFormModalContent
      key={company?.id ?? "new-company"}
      company={company}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

interface CompanyFormModalContentProps {
  company: Company | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; status?: CompanyStatus }) => Promise<void>;
}

function CompanyFormModalContent({
  company,
  loading,
  onClose,
  onSubmit,
}: CompanyFormModalContentProps) {
  const [name, setName] = useState(company?.name ?? "");
  const [status, setStatus] = useState<CompanyStatus>(
    company?.status ?? "active",
  );
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Company name is required.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        name: trimmedName,
        ...(company ? { status } : {}),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save company. Please try again.",
      );
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={company ? "Edit Company" : "Create Company"}
      description={
        company
          ? "Update the company name or its status."
          : "Add a company to the shared CritaSpace workspace."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Company Name"
          name="companyName"
          placeholder="Enter company name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={100}
          autoFocus
          disabled={loading}
        />

        {company && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="company-status"
              className="text-sm font-semibold text-text-primary"
            >
              Status
            </label>

            <select
              id="company-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as CompanyStatus)
              }
              disabled={loading}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : company
                ? "Save Changes"
                : "Create Company"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CompanyFormModal;
