import { api } from "../../lib/api";
import type {
  DashboardSummary,
  DashboardSummaryResponse,
} from "./dashboard.types";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response =
    await api.get<DashboardSummaryResponse>("/dashboard/summary");

  return response.data.data;
};
