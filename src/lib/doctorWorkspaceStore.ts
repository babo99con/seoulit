export type FavoriteDiagnosis = {
  code: string;
  label: string;
};

export type EncounterDraft = {
  encounterId: number;
  patientName?: string | null;
  patientNo?: string | null;
  diagnosisCode?: string | null;
  diagnoses?: Array<{ diagnosisCode: string; diagnosisName?: string | null; primary?: boolean; sortOrder?: number }>;
  chiefComplaint?: string | null;
  assessment?: string | null;
  planNote?: string | null;
  memo?: string | null;
  updatedAt: string;
};

const FAVORITE_DIAGNOSIS_KEY = "doctor.favoriteDiagnosis.v1";
const ENCOUNTER_DRAFTS_KEY = "doctor.encounterDrafts.v1";

const isBrowser = () => typeof window !== "undefined";

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const listFavoriteDiagnoses = (): FavoriteDiagnosis[] => {
  if (!isBrowser()) return [];
  const list = safeParse<FavoriteDiagnosis[]>(window.localStorage.getItem(FAVORITE_DIAGNOSIS_KEY), []);
  return list
    .map((x) => ({ code: (x.code || "").trim().toUpperCase(), label: (x.label || "").trim() }))
    .filter((x) => x.code && x.label);
};

export const saveFavoriteDiagnoses = (items: FavoriteDiagnosis[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(FAVORITE_DIAGNOSIS_KEY, JSON.stringify(items));
};

export const listEncounterDrafts = (): EncounterDraft[] => {
  if (!isBrowser()) return [];
  const list = safeParse<EncounterDraft[]>(window.localStorage.getItem(ENCOUNTER_DRAFTS_KEY), []);
  return list
    .filter((x) => Number.isFinite(x.encounterId))
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
};

export const getEncounterDraft = (encounterId: number): EncounterDraft | null => {
  const list = listEncounterDrafts();
  return list.find((x) => x.encounterId === encounterId) ?? null;
};

export const upsertEncounterDraft = (draft: EncounterDraft) => {
  if (!isBrowser()) return;
  const list = listEncounterDrafts().filter((x) => x.encounterId !== draft.encounterId);
  list.unshift(draft);
  window.localStorage.setItem(ENCOUNTER_DRAFTS_KEY, JSON.stringify(list.slice(0, 40)));
};

export const removeEncounterDraft = (encounterId: number) => {
  if (!isBrowser()) return;
  const next = listEncounterDrafts().filter((x) => x.encounterId !== encounterId);
  window.localStorage.setItem(ENCOUNTER_DRAFTS_KEY, JSON.stringify(next));
};
