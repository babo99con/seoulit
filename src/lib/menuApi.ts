import axios from "axios";
import type { MenuNode } from "../types/menu";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://192.168.1.60:8081",
});

export const fetchMenusApi = async (): Promise<MenuNode[]> => {
  const res = await api.get<MenuNode[]>("/api/menus");
  return res.data;
};

