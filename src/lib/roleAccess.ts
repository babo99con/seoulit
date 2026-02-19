export const normalizeRole = (role?: string | null) => {
  const normalized = (role || "").toUpperCase();
  if (normalized.includes("ADMIN") || normalized.includes("관리자")) return "ADMIN";
  if (normalized.includes("DOCTOR") || normalized.includes("의사")) return "DOCTOR";
  if (normalized.includes("NURSE") || normalized.includes("간호")) return "NURSE";
  if (normalized.includes("RECEPTION") || normalized.includes("원무")) return "RECEPTION";
  if (normalized.includes("STAFF") || normalized.includes("직원") || normalized.includes("스탭")) return "STAFF";
  return "UNKNOWN";
};

export const getDefaultPathByRole = (role?: string | null) => {
  const normalized = normalizeRole(role);
  if (normalized === "ADMIN") return "/";
  if (normalized === "DOCTOR") return "/doctor";
  if (normalized === "NURSE") return "/nurse";
  if (normalized === "STAFF") return "/staff";
  return "/reception";
};

const ACCESS_RULES: Record<string, string[]> = {
  ADMIN: ["*"],
  DOCTOR: ["/", "/doctor", "/patients", "/consents", "/insurances", "/display", "/my_account"],
  NURSE: ["/", "/nurse", "/patients", "/display", "/my_account"],
  RECEPTION: ["/", "/reception", "/patients", "/consents", "/insurances", "/display", "/my_account"],
  STAFF: ["/", "/staff", "/my_account"],
  UNKNOWN: ["/", "/reception", "/my_account"],
};

export const canAccessPath = (role: string | null | undefined, pathname: string) => {
  const normalized = normalizeRole(role);
  const rules = ACCESS_RULES[normalized] ?? ACCESS_RULES.UNKNOWN;
  if (rules.includes("*")) return true;

  return rules.some((base) => pathname === base || pathname.startsWith(`${base}/`));
};

export const getVisibleModulesByRole = (role?: string | null) => {
  const normalized = normalizeRole(role);
  if (normalized === "ADMIN") return ["doctor", "nurse", "staff", "reception", "admin"];
  if (normalized === "DOCTOR") return ["doctor"];
  if (normalized === "NURSE") return ["nurse"];
  if (normalized === "STAFF") return ["staff"];
  return ["reception"];
};
