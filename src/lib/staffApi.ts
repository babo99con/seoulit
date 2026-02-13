import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import type { StaffListItem } from "@/features/staff/staffTypes";
import { getAccessToken } from "@/lib/session";

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

export type StaffSearchCondition =
  | "name"
  | "department"
  | "position"
  | "staff_type"
  | "staff_id";

export const fetchStaffListApi = async (
  activeOnly = true
): Promise<StaffListItem[]> => {
  const res = await api.get<ApiResponse<StaffListItem[]>>(
    "/api/jpa/medical-staff",
    {
      params: { activeOnly },
    }
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};

export const searchStaffApi = async (
  condition: StaffSearchCondition,
  value: string,
  activeOnly = true
): Promise<StaffListItem[]> => {
  const res = await api.get<ApiResponse<StaffListItem[]>>(
    "/api/jpa/medical-staff/search",
    {
      params: { condition, value, activeOnly },
    }
  );
  if (!res.data.success) {
    return [];
  }
  return res.data.result;
};

export const checkStaffUsernameApi = async (username: string): Promise<boolean> => {
  const res = await api.get<ApiResponse<boolean>>(
    "/api/jpa/medical-staff/exists",
    { params: { username } }
  );
  if (!res.data.success) {
    return false;
  }
  return res.data.result;
};
