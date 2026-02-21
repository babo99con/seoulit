import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import { getAccessToken } from "@/lib/session";

export type LeaveLine = {
  id: number;
  lineType: "APPROVAL" | "CC";
  approverId: string;
  approverName: string;
  lineOrder: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  actedAt?: string;
};

export type LeaveRequest = {
  id: number;
  requesterId: string;
  requesterName: string;
  department: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  finalStatus: string;
  createdAt: string;
  lines: LeaveLine[];
};

export type ApprovedLeave = {
  requesterId: string;
  requesterName: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STAFF_API_BASE_URL ?? "",
});

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

export const fetchLeaveRequestsApi = async (tab: "pending" | "mine" | "approval") => {
  try {
    const res = await api.get<ApiResponse<LeaveRequest[]>>(`/api/jpa/leave`, { params: { tab } });
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || "조회에 실패했습니다.");
    return res.data.result;
  } catch (e) {
    throw parseError(e, "조회에 실패했습니다.");
  }
};

export const createLeaveRequestApi = async (req: {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  approverIds: string[];
  ccIds: string[];
}) => {
  try {
    const res = await api.post<ApiResponse<LeaveRequest>>(`/api/jpa/leave`, req);
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || "생성에 실패했습니다.");
    return res.data.result;
  } catch (e) {
    throw parseError(e, "생성에 실패했습니다.");
  }
};

export const decideLeaveRequestApi = async (requestId: number, req: { lineId: number; action: "APPROVED" | "REJECTED" }) => {
  try {
    const res = await api.post<ApiResponse<LeaveRequest>>(`/api/jpa/leave/${requestId}/decision`, req);
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || "처리에 실패했습니다.");
    return res.data.result;
  } catch (e) {
    throw parseError(e, "처리에 실패했습니다.");
  }
};

export const fetchApprovedLeavesApi = async () => {
  try {
    const res = await api.get<ApiResponse<ApprovedLeave[]>>(`/api/jpa/leave/approved`);
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || "조회에 실패했습니다.");
    return res.data.result;
  } catch (e) {
    throw parseError(e, "조회에 실패했습니다.");
  }
};
