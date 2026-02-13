import axios from "axios";
import type { ApiResponse } from "../features/patients/patientTypes";

export type VisitHistory = {
  id: number;
  visitId: number;
  eventType?: string | null;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  changedBy?: string | null;
  changedAt?: string | null;
};

import { getAccessToken } from "@/lib/session";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL ?? "",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchVisitHistoryApi = async (
  visitId: number
): Promise<VisitHistory[]> => {
  const res = await api.get<ApiResponse<VisitHistory[]>>(
    `/api/visits/${visitId}/history`
  );
  if (!res.data.success) return [];
  return res.data.result ?? [];
};

export const fetchAllVisitHistoryApi = async (): Promise<VisitHistory[]> => {
  const res = await api.get<ApiResponse<VisitHistory[]>>(`/api/visits/history`);
  if (!res.data.success) return [];
  return res.data.result ?? [];
};
