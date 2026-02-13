import axios from "axios";
import type { ApiResponse } from "../features/patients/patientTypes";

export type VisitEmergency = {
  visitId: number;
  triageLevel?: string | null;
  ambulanceYn?: boolean | null;
  traumaYn?: boolean | null;
  note?: string | null;
};

export type VisitEmergencyPayload = {
  triageLevel?: string | null;
  ambulanceYn?: boolean | null;
  traumaYn?: boolean | null;
  note?: string | null;
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

export const fetchVisitEmergencyApi = async (
  visitId: number
): Promise<VisitEmergency | null> => {
  const res = await api.get<ApiResponse<VisitEmergency>>(
    `/api/visits/${visitId}/emergency`
  );
  if (!res.data.success) return null;
  return res.data.result;
};

export const saveVisitEmergencyApi = async (
  visitId: number,
  payload: VisitEmergencyPayload
): Promise<VisitEmergency> => {
  const res = await api.put<ApiResponse<VisitEmergency>>(
    `/api/visits/${visitId}/emergency`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "응급 정보 저장 실패");
  }
  return res.data.result;
};

export const deleteVisitEmergencyApi = async (visitId: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(
    `/api/visits/${visitId}/emergency`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "응급 정보 삭제 실패");
  }
};
