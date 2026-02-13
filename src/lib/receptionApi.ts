import axios from "axios";
import type { ApiResponse } from "../features/patients/patientTypes";

export type VisitRes = {
  id: number;
  visitNo: string;
  patientId: number;
  patientNo?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  visitType: string;
  status: string;
  deptCode: string;
  doctorId?: string | null;
  priorityYn?: boolean | null;
  queueNo?: number | null;
  calledAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  memo?: string | null;
  cancelledAt?: string | null;
  cancelReasonCode?: string | null;
  cancelMemo?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  reservationId?: string | null;
  scheduledAt?: string | null;
  arrivalAt?: string | null;
  reservationNote?: string | null;
};

export type VisitCreatePayload = {
  visitNo?: string | null;
  patientId: number;
  patientNo?: string | null;
  patientName?: string | null;
  patientPhone?: string | null;
  visitType: string;
  deptCode: string;
  doctorId?: string | null;
  priorityYn?: boolean | null;
  queueNo?: number | null;
  memo?: string | null;
  createdBy?: string | null;
  reservationId?: string | null;
  scheduledAt?: string | null;
  arrivalAt?: string | null;
  reservationNote?: string | null;
};

export type VisitUpdatePayload = {
  visitType?: string | null;
  status?: string | null;
  deptCode?: string | null;
  doctorId?: string | null;
  priorityYn?: boolean | null;
  queueNo?: number | null;
  calledAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  memo?: string | null;
  cancelledAt?: string | null;
  cancelReasonCode?: string | null;
  cancelMemo?: string | null;
  updatedBy?: string | null;
  reservationId?: string | null;
  scheduledAt?: string | null;
  arrivalAt?: string | null;
  reservationNote?: string | null;
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

export const fetchVisitsApi = async (): Promise<VisitRes[]> => {
  const res = await api.get<ApiResponse<VisitRes[]>>("/api/visits");
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const createVisitApi = async (
  payload: VisitCreatePayload
): Promise<VisitRes> => {
  const res = await api.post<ApiResponse<VisitRes>>("/api/visits", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Create failed");
  }
  return res.data.result;
};

export const updateVisitApi = async (
  id: number,
  payload: VisitUpdatePayload
): Promise<VisitRes> => {
  const res = await api.put<ApiResponse<VisitRes>>(`/api/visits/${id}`, payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Update failed");
  }
  return res.data.result;
};

export const deleteVisitApi = async (id: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/visits/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.message || "Delete failed");
  }
};

