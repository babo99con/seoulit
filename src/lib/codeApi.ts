import axios from "axios";
import type { ApiResponse } from "../features/patients/patientTypes";

export type CodeItem = {
  id: number;
  groupCode: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
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

export const fetchCodesApi = async (group: string): Promise<CodeItem[]> => {
  const res = await api.get<ApiResponse<CodeItem[]>>("/api/codes", {
    params: { group },
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Fetch failed");
  }
  return res.data.result;
};
