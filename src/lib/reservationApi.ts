import axios from "axios";
import type { ApiResponse } from "../features/patients/patientTypes";

export type VisitReservation = {
  visitId: number;
  reservationId?: string | null;
  scheduledAt?: string | null;
  arrivalAt?: string | null;
  note?: string | null;
};

export type VisitReservationPayload = {
  reservationId?: string | null;
  scheduledAt?: string | null;
  arrivalAt?: string | null;
  note?: string | null;
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

export const fetchVisitReservationApi = async (
  visitId: number
): Promise<VisitReservation | null> => {
  const res = await api.get<ApiResponse<VisitReservation>>(
    `/api/visits/${visitId}/reservations`
  );
  if (!res.data.success) return null;
  return res.data.result;
};

export const saveVisitReservationApi = async (
  visitId: number,
  payload: VisitReservationPayload
): Promise<VisitReservation> => {
  const res = await api.put<ApiResponse<VisitReservation>>(
    `/api/visits/${visitId}/reservations`,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "예약 저장 실패");
  }
  return res.data.result;
};

export const deleteVisitReservationApi = async (visitId: number): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(
    `/api/visits/${visitId}/reservations`
  );
  if (!res.data.success) {
    throw new Error(res.data.message || "예약 삭제 실패");
  }
};
