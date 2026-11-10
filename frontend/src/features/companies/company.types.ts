export type CompanyStatus = "active" | "inactive";

export interface Company {
  id: string;
  name: string;
  status: CompanyStatus;
  createdAt: unknown;
  updatedAt: unknown;
  createdBy: string;
}

export interface CreateCompanyRequest {
  name: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  status?: CompanyStatus;
}

export interface CompanyResponse {
  success: boolean;
  message?: string;
  data: Company;
}

export interface CompaniesResponse {
  success: boolean;
  data: Company[];
}
