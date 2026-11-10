import { api } from "../../lib/api";
import type {
  CompaniesResponse,
  CompanyResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "./company.types";

const BASE_PATH = "/admin/companies";

export const getCompanies = async () => {
  const response = await api.get<CompaniesResponse>(BASE_PATH);
  return response.data.data;
};

export const getCompanyById = async (companyId: string) => {
  const response = await api.get<CompanyResponse>(`${BASE_PATH}/${companyId}`);
  return response.data.data;
};

export const createCompany = async (payload: CreateCompanyRequest) => {
  const response = await api.post<CompanyResponse>(BASE_PATH, payload);
  return response.data.data;
};

export const updateCompany = async (
  companyId: string,
  payload: UpdateCompanyRequest,
) => {
  const response = await api.patch<CompanyResponse>(
    `${BASE_PATH}/${companyId}`,
    payload,
  );
  return response.data.data;
};
