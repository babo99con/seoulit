import axios from "axios";
import type { MenuNode } from "../types/menu";
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

export const fetchMenusApi = async (): Promise<MenuNode[]> => {
  const res = await api.get<MenuNode[]>("/api/menus");
  return res.data;
};
