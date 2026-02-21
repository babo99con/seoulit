import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import { getAccessToken } from "@/lib/session";

export type ShiftAssignment = {
  id: number;
  shiftDate: string;
  staffId: string;
  staffName: string;
  departmentName: string;
  shiftType: "DAY" | "NIGHT";
  createdBy: string;
  createdAt: string;
};

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_STAFF_API_BASE_URL ?? "" });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const parseError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const msg = error.response?.data?.message;
    if (msg) return new Error(msg);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
};

export const fetchShiftAssignmentsApi = async (params: { fromDate?: string; toDate?: string }) => {
  try {
    const res = await api.get<ApiResponse<ShiftAssignment[]>>(`/api/jpa/shifts`, { params });
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || "조회 실패");
    return res.data.result;
  } catch (e) {
    throw parseError(e, "조회 실패");
  }
};

export const createShiftAssignmentApi = async (req: {
  shiftDate: string;
  staffId: string;
  staffName: string;
  departmentName: string;
  shiftType: "DAY" | "NIGHT";
}) => {
  try {
    const res = await api.post<ApiResponse<ShiftAssignment>>(`/api/jpa/shifts`, req);
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || "저장 실패");
    return res.data.result;
  } catch (e) {
    throw parseError(e, "저장 실패");
  }
};
