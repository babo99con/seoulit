import axios from "axios";
import type { ApiResponse } from "@/features/patients/patientTypes";
import { getAccessToken } from "@/lib/session";

export type MedicalEncounter = {
  id: number;
  visitId: number;
  patientId: number;
  patientNo?: string | null;
  patientName?: string | null;
  doctorId?: string | null;
  deptCode?: string | null;
  status: string;
  isActive: "Y" | "N";
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type MedicalEncounterDetail = MedicalEncounter & {
  chiefComplaint?: string | null;
  assessment?: string | null;
  planNote?: string | null;
  diagnosisCode?: string | null;
  diagnoses?: MedicalEncounterDiagnosis[];
  memo?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  inactiveReasonCode?: string | null;
  inactiveReasonMemo?: string | null;
  inactivatedAt?: string | null;
};

export type MedicalEncounterDiagnosis = {
  id?: number | null;
  diagnosisCode: string;
  diagnosisName?: string | null;
  primary?: boolean;
  sortOrder?: number;
};

export type DiagnosisCodeCandidate = {
  code: string;
  name?: string | null;
};

export type MedicalEncounterHistory = {
  id: number;
  encounterId: number;
  eventType?: string | null;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  changedBy?: string | null;
  changedAt?: string | null;
};

export type MedicalEncounterAsset = {
  id: number;
  encounterId: number;
  patientId: number;
  assetType: "PEN" | "IMAGE" | string;
  templateCode?: string | null;
  objectKey: string;
  fileUrl?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
};

export type EncounterPage = {
  items: MedicalEncounter[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type EncounterSearchParams = {
  keyword?: string;
  status?: string;
  doctorId?: string;
  fromDate?: string;
  toDate?: string;
  includeInactive?: boolean;
  page?: number;
  size?: number;
};

export type UpdateEncounterPayload = {
  doctorId?: string | null;
  deptCode?: string | null;
  status?: string | null;
  chiefComplaint?: string | null;
  assessment?: string | null;
  planNote?: string | null;
  diagnosisCode?: string | null;
  diagnoses?: MedicalEncounterDiagnosis[];
  memo?: string | null;
  updatedBy?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MEDICAL_API_BASE_URL ?? "",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchEncountersApi = async (params: EncounterSearchParams = {}): Promise<EncounterPage> => {
  const res = await api.get<ApiResponse<EncounterPage>>("/api/medical/encounters", { params });
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Failed to fetch encounters");
  }
  return res.data.result;
};

export const fetchEncounterDetailApi = async (encounterId: number): Promise<MedicalEncounterDetail> => {
  const res = await api.get<ApiResponse<MedicalEncounterDetail>>(`/api/medical/encounters/${encounterId}`);
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Failed to fetch encounter detail");
  }
  return res.data.result;
};

export const fetchEncounterHistoryApi = async (encounterId: number): Promise<MedicalEncounterHistory[]> => {
  const res = await api.get<ApiResponse<MedicalEncounterHistory[]>>(`/api/medical/encounters/${encounterId}/history`);
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Failed to fetch encounter history");
  }
  return res.data.result;
};

export const updateEncounterApi = async (encounterId: number, payload: UpdateEncounterPayload): Promise<MedicalEncounterDetail> => {
  const res = await api.put<ApiResponse<MedicalEncounterDetail>>(`/api/medical/encounters/${encounterId}`, payload);
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Failed to update encounter");
  }
  return res.data.result;
};

export const deactivateEncounterApi = async (
  encounterId: number,
  payload: { reasonCode: string; reasonMemo?: string; updatedBy?: string }
): Promise<MedicalEncounterDetail> => {
  const res = await api.patch<ApiResponse<MedicalEncounterDetail>>(`/api/medical/encounters/${encounterId}/deactivate`, payload);
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Failed to deactivate encounter");
  }
  return res.data.result;
};

export const activateEncounterApi = async (encounterId: number, updatedBy?: string): Promise<MedicalEncounterDetail> => {
  const res = await api.patch<ApiResponse<MedicalEncounterDetail>>(`/api/medical/encounters/${encounterId}/activate`, null, {
    params: { updatedBy },
  });
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Failed to activate encounter");
  }
  return res.data.result;
};

export const fetchEncounterAssetsApi = async (encounterId: number): Promise<MedicalEncounterAsset[]> => {
  const res = await api.get<ApiResponse<MedicalEncounterAsset[]>>(`/api/medical/encounters/${encounterId}/assets`);
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Failed to fetch encounter assets");
  }
  return res.data.result;
};

export const createEncounterAssetApi = async (
  encounterId: number,
  data: { assetType: "PEN" | "IMAGE"; templateCode?: string; createdBy?: string },
  file: File
): Promise<MedicalEncounterAsset> => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  formData.append("file", file);

  const res = await api.post<ApiResponse<MedicalEncounterAsset>>(`/api/medical/encounters/${encounterId}/assets`, formData);
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Failed to create encounter asset");
  }
  return res.data.result;
};

export const deleteEncounterAssetApi = async (encounterId: number, assetId: number, deletedBy?: string): Promise<void> => {
  const res = await api.delete<ApiResponse<void>>(`/api/medical/encounters/${encounterId}/assets/${assetId}`, {
    params: deletedBy ? { deletedBy } : undefined,
  });
  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to delete encounter asset");
  }
};

export const fetchDiagnosisCodeCandidatesApi = async (keyword?: string, size = 20): Promise<DiagnosisCodeCandidate[]> => {
  const res = await api.get<ApiResponse<DiagnosisCodeCandidate[]>>(`/api/medical/encounters/diagnosis-codes`, {
    params: { keyword, size },
  });
  if (!res.data.success || !res.data.result) {
    throw new Error(res.data.message || "Failed to fetch diagnosis codes");
  }
  return res.data.result;
};
