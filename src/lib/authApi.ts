import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import { getAccessToken } from "@/lib/session";

type LoginRequest = {
  username: string;
  password: string;
};

export type AuthUser = {
  staffId: number;
  username: string;
  fullName: string;
  role: string;
};

export type LoginResult = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ?? "",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginApi = async (payload: LoginRequest): Promise<LoginResult> => {
  const res = await api.post<ApiResponse<LoginResult>>("/api/auth/login", payload);
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Login failed");
  }
  return res.data.result;
};

export const getMeApi = async (): Promise<AuthUser> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No access token");
  }

  const res = await api.get<ApiResponse<AuthUser>>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Unauthorized");
  }
  return res.data.result;
};
