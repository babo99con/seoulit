export function resolvePublicFileUrl(url?: string | null) {
  if (!url) return "";

  const trim = url.trim();
  if (!trim) return "";

  if (typeof window === "undefined") return trim;

  try {
    const parsed = new URL(trim, window.location.origin);
    const path = parsed.pathname || "";
    const isMinioBucketPath =
      path.startsWith("/hospital-files/") ||
      path.startsWith("/staff-profile/") ||
      path.startsWith("/patient-files/");

    if (isMinioBucketPath) {
      return `${path}${parsed.search || ""}`;
    }

    return parsed.toString();
  } catch {
    return trim;
  }
}
