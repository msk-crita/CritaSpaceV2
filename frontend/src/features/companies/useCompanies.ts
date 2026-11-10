import { useCallback, useEffect, useState } from "react";
import {
  createCompany as createCompanyService,
  getCompanies,
  updateCompany as updateCompanyService,
} from "./company.service";
import type {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "./company.types";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    let cancelled = false;

    getCompanies()
      .then((data) => {
        if (!cancelled) {
          setCompanies(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load companies. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Manual refresh
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch {
      setError("Unable to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompany = async (payload: CreateCompanyRequest) => {
    const company = await createCompanyService(payload);
    setCompanies((current) => [company, ...current]);
    return company;
  };

  const updateCompany = async (
    companyId: string,
    payload: UpdateCompanyRequest,
  ) => {
    const updatedCompany = await updateCompanyService(companyId, payload);

    setCompanies((current) =>
      current.map((company) =>
        company.id === companyId ? updatedCompany : company,
      ),
    );

    return updatedCompany;
  };

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
  };
}
