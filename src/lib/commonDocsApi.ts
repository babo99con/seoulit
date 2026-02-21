import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import { getAccessToken } from "@/lib/session";

export type CommonDoc = {
  id: number;
  box?: string;
  category: string;
  title: string;
  content?: string | null;
  versionLabel: string;
  ownerName: string;
  senderDeptId?: number | null;
  senderDeptName?: string | null;
  receiverDeptId?: number | null;
  receiverDeptName?: string | null;
  approverId?: string | null;
  approverName?: string | null;
  approvalStatus?: string | null;
  rejectionReason?: string | null;
  attachmentFileName?: string | null;
  attachmentMimeType?: string | null;
  hasAttachment?: boolean;
  lines?: CommonDocLine[];
  authorId: string;
  authorName: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CommonDocLine = {
  id: number;
  lineOrder: number;
  lineType: string;
  approverId: string;
  approverName: string;
  actionStatus: string;
  actionComment?: string | null;
  actedAt?: string | null;
};

export type CommonDocPage = {
  items: CommonDoc[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type CommonDocReq = {
  box?: string;
  category: string;
  title: string;
  content?: string;
  versionLabel?: string;
  ownerName?: string;
  receiverDeptId?: number | null;
  receiverDeptName?: string;
  approverId?: string;
  approverName?: string;
  approverIds?: string[];
  ccIds?: string[];
  lineId?: number;
  approvalAction?: string;
  rejectionReason?: string;
  attachmentFileName?: string;
  attachmentMimeType?: string;
  attachmentBase64?: string;
  authorId: string;
  authorName: string;
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
    const message = error.response?.data?.message;
    if (message) return new Error(message);
  }
  if (error instanceof Error) return error;
  return new Error(fallback);
};

export const fetchCommonDocPageApi = async (page: number, size: number, keyword = "", box = "ALL"): Promise<CommonDocPage> => {
  try {
    const res = await api.get<ApiResponse<CommonDocPage>>("/api/jpa/common-docs", { params: { page, size, keyword, box } });
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || "문서 목록 조회 실패");
    return res.data.result;
  } catch (error) {
    throw parseError(error, "문서 목록 조회 실패");
  }
};

export const fetchCommonDocApi = async (id: number): Promise<CommonDoc> => {
  try {
    const res = await api.get<ApiResponse<CommonDoc>>(`/api/jpa/common-docs/${id}`);
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || "문서 상세 조회 실패");
    return res.data.result;
  } catch (error) {
    throw parseError(error, "문서 상세 조회 실패");
  }
};

export const createCommonDocApi = async (req: CommonDocReq): Promise<CommonDoc> => {
  try {
    const res = await api.post<ApiResponse<CommonDoc>>("/api/jpa/common-docs", req);
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || "문서 등록 실패");
    return res.data.result;
  } catch (error) {
    throw parseError(error, "문서 등록 실패");
  }
};

export const updateCommonDocApi = async (id: number, req: CommonDocReq): Promise<CommonDoc> => {
  try {
    const res = await api.put<ApiResponse<CommonDoc>>(`/api/jpa/common-docs/${id}`, req);
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || "문서 수정 실패");
    return res.data.result;
  } catch (error) {
    throw parseError(error, "문서 수정 실패");
  }
};

export const deleteCommonDocApi = async (id: number): Promise<void> => {
  try {
    const res = await api.delete<ApiResponse<void>>(`/api/jpa/common-docs/${id}`, { data: {} });
    if (!res.data.success) throw new Error(res.data.message || "문서 삭제 실패");
  } catch (error) {
    throw parseError(error, "문서 삭제 실패");
  }
};
