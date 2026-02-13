import axios from "axios";
import type { ApiResponse } from "../features/patients/patientTypes";

export type PatientInfoHistory = {
  historyId: number;
  patientId: number;
  changeType: string;
  beforeData?: string | null;
  afterData?: string | null;
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

export const fetchPatientInfoHistoryApi = async (
  patientId: number
): Promise<PatientInfoHistory[]> => {
  const res = await api.get<ApiResponse<PatientInfoHistory[]>>(
    "/api/patients/info-history",
    { params: { patientId } }
  );
  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};