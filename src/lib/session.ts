export type SessionUser = {
  staffId: number;
  username: string;
  fullName: string;
  role: string;
};

const TOKEN_KEY = "his.accessToken";
const USER_KEY = "his.user";
const PASSWORD_CHANGE_REQUIRED_KEY = "his.passwordChangeRequired";
const TOKEN_COOKIE_KEY = "his_access_token";
const FORCE_PASSWORD_COOKIE_KEY = "his_force_password_change";
const COOKIE_MAX_AGE = 60 * 60 * 12;

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getSessionUser = (): SessionUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
};

export const setPasswordChangeRequired = (required: boolean) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PASSWORD_CHANGE_REQUIRED_KEY, required ? "1" : "0");
  document.cookie = `${FORCE_PASSWORD_COOKIE_KEY}=${required ? "1" : "0"}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

export const isPasswordChangeRequired = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PASSWORD_CHANGE_REQUIRED_KEY) === "1";
};

export const saveSession = (token: string, user: SessionUser, options?: { passwordChangeRequired?: boolean }) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setPasswordChangeRequired(Boolean(options?.passwordChangeRequired));
};

export const saveSessionUserOnly = (user: SessionUser, options?: { passwordChangeRequired?: boolean }) => {
  saveSession("", user, options);
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);
  document.cookie = `${TOKEN_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${FORCE_PASSWORD_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
};
