import axios from "axios";
import type { ApiResponse } from "../features/patients/patientTypes";

export type PatientRestriction = {
  restrictionId: number;
  patientId: number;
  restrictionType: string;
  activeYn: boolean;
  reason?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  createdBy?: string | null;
};

export type PatientRestrictionCreatePayload = {
  patientId: number;
  restrictionType: string;
  reason?: string | null;
  endAt?: string | null;
  createdBy?: string | null;
};

export type PatientRestrictionUpdatePayload = {
  restrictionType?: string | null;
  activeYn?: boolean | null;
  reason?: string | null;
  endAt?: string | null;
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

export const fetchPatientRestrictionsApi = async (
  patientId: number
): Promise<PatientRestriction[]> => {
  const res = await api.get<ApiResponse<PatientRestriction[]>>(
    "/api/restrictions/search",
    {
      params: { type: "patientId", keyword: patientId },
    }
  );
  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};

export const createPatientRestrictionApi = async (
  payload: PatientRestrictionCreatePayload
): Promise<PatientRestriction> => {
  const res = await api.post<ApiResponse<PatientRestriction>>(
    "/api/restrictions",
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
  return res.data.result;
};

export const updatePatientRestrictionApi = async (
  id: number,
  payload: PatientRestrictionUpdatePayload
): Promise<PatientRestriction> => {
  const res = await api.put<ApiResponse<PatientRestriction>>(
    `/api/restrictions/${id}`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const deletePatientRestrictionApi = async (id: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/restrictions/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};

