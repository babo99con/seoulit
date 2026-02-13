import axios from "axios";
import type { ApiResponse } from "../features/patients/patientTypes";

export type PatientStatusHistory = {
  historyId: number;
  patientId: number;
  fromStatus: string;
  toStatus: string;
  reason?: string | null;
  changedBy?: string | null;
  changedAt?: string | null;
};

import { getAccessToken } from "@/lib/session";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchPatientStatusHistoryApi = async (
  patientId: number
): Promise<PatientStatusHistory[]> => {
  const res = await api.get<ApiResponse<PatientStatusHistory[]>>(
    "/api/status-history/search",
    {
      params: { type: "patientId", keyword: patientId },
    }
  );
  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};

