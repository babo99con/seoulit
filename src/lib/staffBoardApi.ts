import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import { getAccessToken } from "@/lib/session";

export type StaffBoardCategory = "NOTICE" | "SCHEDULE" | "EVENT";

export type StaffBoardPost = {
  id: number;
  category: StaffBoardCategory;
  postType: string;
  title: string;
  content?: string | null;
  eventDate?: string | null;
  location?: string | null;
  subjectName?: string | null;
  departmentName?: string | null;
  authorId: string;
  authorName: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type StaffBoardPage = {
  items: StaffBoardPost[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type StaffBoardPostReq = {
  postType?: string;
  title: string;
  content?: string;
  eventDate?: string;
  location?: string;
  subjectName?: string;
  departmentName?: string;
  authorId: string;
  authorName: string;
  deletePin?: string;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STAFF_API_BASE_URL ?? "",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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

export const fetchStaffBoardPageApi = async (params: {
  category: StaffBoardCategory;
  keyword?: string;
  page: number;
  size: number;
}): Promise<StaffBoardPage> => {
  try {
    const res = await api.get<ApiResponse<StaffBoardPage>>(`/api/jpa/staff-board/${params.category}`, {
      params: {
        keyword: params.keyword || "",
        page: params.page,
        size: params.size,
      },
    });
    if (!res.data.success || !res.data.result) {
      throw new Error(res.data.message || "목록 조회에 실패했습니다.");
    }
    return res.data.result;
  } catch (error) {
    throw parseError(error, "목록 조회에 실패했습니다.");
  }
};

export const createStaffBoardPostApi = async (category: StaffBoardCategory, req: StaffBoardPostReq): Promise<StaffBoardPost> => {
  try {
    const res = await api.post<ApiResponse<StaffBoardPost>>(`/api/jpa/staff-board/${category}`, req);
    if (!res.data.success || !res.data.result) {
      throw new Error(res.data.message || "등록에 실패했습니다.");
    }
    return res.data.result;
  } catch (error) {
    throw parseError(error, "등록에 실패했습니다.");
  }
};

export const fetchStaffBoardPostApi = async (category: StaffBoardCategory, id: number): Promise<StaffBoardPost> => {
  try {
    const res = await api.get<ApiResponse<StaffBoardPost>>(`/api/jpa/staff-board/${category}/${id}`);
    if (!res.data.success || !res.data.result) {
      throw new Error(res.data.message || "상세 조회에 실패했습니다.");
    }
    return res.data.result;
  } catch (error) {
    throw parseError(error, "상세 조회에 실패했습니다.");
  }
};

export const updateStaffBoardPostApi = async (category: StaffBoardCategory, id: number, req: StaffBoardPostReq): Promise<StaffBoardPost> => {
  try {
    const res = await api.put<ApiResponse<StaffBoardPost>>(`/api/jpa/staff-board/${category}/${id}`, req);
    if (!res.data.success || !res.data.result) {
      throw new Error(res.data.message || "수정에 실패했습니다.");
    }
    return res.data.result;
  } catch (error) {
    throw parseError(error, "수정에 실패했습니다.");
  }
};

export const deleteStaffBoardPostApi = async (category: StaffBoardCategory, id: number, deletePin: string): Promise<void> => {
  try {
    const res = await api.delete<ApiResponse<void>>(`/api/jpa/staff-board/${category}/${id}`, {
      data: { deletePin },
    });
    if (!res.data.success) {
      throw new Error(res.data.message || "삭제에 실패했습니다.");
    }
  } catch (error) {
    throw parseError(error, "삭제에 실패했습니다.");
  }
};
