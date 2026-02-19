"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";
import {
  checkUsernameAvailabilityApi,
  getMeApi,
  getRegisterSocialVerifyUrl,
  loginApi,
  registerApi,
  sendRegisterEmailCodeApi,
  verifyRegisterEmailCodeApi,
} from "@/lib/authApi";
import { saveSession, saveSessionUserOnly } from "@/lib/session";

const SAVED_USERNAME_KEY = "login.savedUsername";
const LOGIN_ONBOARDING_SEEN_KEY = "onboarding.login.seen.v1";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerAgreed, setRegisterAgreed] = useState(false);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameCheckMessage, setUsernameCheckMessage] = useState<string | null>(null);
  const [registerFlow, setRegisterFlow] = useState<"choice" | "basic" | "social">("choice");
  const [socialVerified, setSocialVerified] = useState(false);
  const [socialVerifyToken, setSocialVerifyToken] = useState("");
  const [socialVerifiedName, setSocialVerifiedName] = useState("");
  const [socialProvider, setSocialProvider] = useState<"naver" | "google" | "">("");
  const [rememberUsername, setRememberUsername] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [emailCode, setEmailCode] = useState("");
  const [emailVerifiedToken, setEmailVerifiedToken] = useState("");
  const [emailVerifyMessage, setEmailVerifyMessage] = useState<string | null>(null);
  const [emailSendLoading, setEmailSendLoading] = useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [emailResendSec, setEmailResendSec] = useState(0);
  const [emailValidSec, setEmailValidSec] = useState(0);
  const emailCodeInputRef = useRef<HTMLInputElement | null>(null);
  const [registerNotice, setRegisterNotice] = useState<string | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");
  const [prefersDark, setPrefersDark] = useState(false);

  const resolvedTheme = themeMode === "system" ? (prefersDark ? "dark" : "light") : themeMode;
  const isDark = resolvedTheme === "dark";
  const pageBackground = isDark
    ? "radial-gradient(circle at 72% -8%, rgba(74,121,255,0.28), transparent 42%), radial-gradient(circle at 10% 108%, rgba(20,184,166,0.2), transparent 34%), linear-gradient(180deg, #0b1220 0%, #111827 55%, #0b1220 100%)"
    : "radial-gradient(circle at 84% -4%, rgba(59,130,246,0.22), transparent 38%), radial-gradient(circle at 6% 104%, rgba(16,185,129,0.18), transparent 32%), linear-gradient(180deg, #eef4ff 0%, #f8fbff 48%, #ecf3ff 100%)";
  const cardBg = isDark ? "rgba(15,23,42,0.84)" : "rgba(255,255,255,0.9)";
  const cardBorder = isDark ? "1px solid rgba(148,163,184,0.24)" : "1px solid rgba(148,163,184,0.35)";
  const headingColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#93a4c3" : "#475569";
  const fieldBg = isDark ? "rgba(15,23,42,0.55)" : "rgba(255,255,255,0.92)";
  const fieldText = isDark ? "#e2e8f0" : "#0f172a";
  const fieldLabel = isDark ? "#94a3b8" : "#64748b";
  const loginButtonBg = isDark ? "#334155" : "#2563eb";
  const loginButtonHover = isDark ? "#3f4d63" : "#1d4ed8";

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setPrefersDark(media.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const registerPasswordLengthOk = registerForm.password.trim().length >= 8;
  const registerPasswordDiffOk = registerForm.password.trim() !== registerForm.username.trim() && registerForm.password.trim() !== registerForm.fullName.trim();
  const registerPasswordConfirmOk = registerForm.password.length > 0 && registerForm.password === registerForm.confirmPassword;
  const registerPasswordScore = [registerPasswordLengthOk, registerPasswordDiffOk, registerPasswordConfirmOk].filter(Boolean).length;
  const registerPasswordScoreValue = registerPasswordScore * 33.3;
  const passwordValidationTouched = registerForm.password.length > 0 || registerForm.confirmPassword.length > 0;
  const canEditRegisterForm = registerFlow === "basic" || (registerFlow === "social" && socialVerified);

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("oauth") !== "ok") {
      if (params.get("oauth") === "register_social_ok") {
        const verifyToken = params.get("verifyToken") || "";
        const verifiedName = params.get("verifiedName") || "";
        const provider = (params.get("provider") || "").toLowerCase();
        setRegisterOpen(true);
        setRegisterFlow("social");
        setRegisterError(null);
        if (verifyToken) {
          setSocialVerified(true);
          setSocialVerifyToken(verifyToken);
          if (provider === "naver" || provider === "google") {
            setSocialProvider(provider);
          }
          setSocialVerifiedName(verifiedName);
          if (verifiedName) {
            setRegisterForm((prev) => ({ ...prev, fullName: prev.fullName || verifiedName }));
          }
        }
        window.history.replaceState({}, "", "/login");
        return;
      }
      const oauthError = params.get("oauthError");
      if (oauthError) {
        setError(`소셜 로그인에 실패했습니다: ${oauthError}`);
      }
      return;
    }

    const run = async () => {
      try {
        const me = await getMeApi();
        if (!mounted) return;
        saveSessionUserOnly(me, { passwordChangeRequired: false });
        router.push("/");
      } catch {
        if (!mounted) return;
        setError("소셜 로그인 세션을 확인하지 못했습니다. 다시 시도해주세요.");
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    const saved = window.localStorage.getItem(SAVED_USERNAME_KEY);
    if (saved) {
      setUsername(saved);
      setRememberUsername(true);
    }

    const seen = window.localStorage.getItem(LOGIN_ONBOARDING_SEEN_KEY);
    if (!seen) {
      setOnboardingOpen(true);
      setOnboardingStep(0);
    }
  }, []);

  useEffect(() => {
    if (emailResendSec <= 0) return;
    const timer = window.setInterval(() => {
      setEmailResendSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [emailResendSec]);

  useEffect(() => {
    if (emailValidSec <= 0) return;
    const timer = window.setInterval(() => {
      setEmailValidSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [emailValidSec]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await loginApi({ username, password });
      if (rememberUsername) {
        window.localStorage.setItem(SAVED_USERNAME_KEY, username.trim());
      } else {
        window.localStorage.removeItem(SAVED_USERNAME_KEY);
      }
      saveSession(result.accessToken, result.user, {
        passwordChangeRequired: result.passwordChangeRequired,
      });
      if (result.passwordChangeRequired) {
        router.push("/my_account?forcePasswordChange=1");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const nextPath = params.get("next") || "/";
      router.push(nextPath);
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (message.includes("AUTH_PENDING_APPROVAL")) {
        setError("가입 승인 대기 상태입니다. 관리자 승인 후 로그인할 수 있습니다.");
      } else if (message.includes("AUTH_INACTIVE_ACCOUNT")) {
        setError("비활성 계정입니다. 관리자에게 문의해주세요.");
      } else {
        setError("로그인에 실패했습니다. 아이디/비밀번호를 확인해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const username = registerForm.username.trim();
    const fullName = registerForm.fullName.trim();
    const email = registerForm.email.trim();
    const phone = registerForm.phone.trim();
    const password = registerForm.password;

    if (!username || (!fullName && !socialVerified)) {
      setRegisterError("필수 항목(아이디, 이름)을 입력해주세요.");
      return;
    }
    if (!/^[a-zA-Z0-9._-]{4,30}$/.test(username)) {
      setRegisterError("아이디는 영문/숫자/._- 조합 4~30자로 입력해주세요.");
      return;
    }
    if (!usernameChecked || usernameAvailable !== true) {
      setRegisterError("아이디 중복 확인을 완료해주세요.");
      return;
    }
    if (password.trim().length < 8) {
      setRegisterError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (!registerPasswordDiffOk) {
      setRegisterError("비밀번호는 아이디/이름과 동일하게 설정할 수 없습니다.");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (!registerAgreed) {
      setRegisterError("가입 신청 안내에 동의해주세요.");
      return;
    }
    if (!socialVerified) {
      if (!emailVerifiedToken) {
        setRegisterError("이메일 인증을 완료해주세요.");
        return;
      }
    }

    try {
      setRegisterLoading(true);
      setRegisterError(null);
      setError(null);
      await registerApi({
        username,
        fullName,
        email: email || undefined,
        phone: phone || undefined,
        emailVerificationToken: emailVerifiedToken || undefined,
        password,
        socialVerifyToken: socialVerifyToken || undefined,
      });
      setRegisterOpen(false);
      setRegisterForm({ username: "", fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
      setEmailCode("");
      setEmailVerifiedToken("");
      setEmailVerifyMessage(null);
      setEmailResendSec(0);
      setEmailValidSec(0);
      setRegisterAgreed(false);
      setUsernameChecked(false);
      setUsernameAvailable(null);
      setUsernameCheckMessage(null);
      setRegisterError(null);
      setSocialVerified(false);
      setSocialVerifyToken("");
      setSocialVerifiedName("");
      setSocialProvider("");
      setRegisterNotice("가입 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다.");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const message = (e.response?.data as { message?: string } | undefined)?.message;
        setRegisterError(message || "가입 신청에 실패했습니다.");
      } else {
        setRegisterError(e instanceof Error ? e.message : "가입 신청에 실패했습니다.");
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleCheckUsername = async () => {
    const username = registerForm.username.trim();
    if (!username) {
      setUsernameChecked(false);
      setUsernameAvailable(null);
      setUsernameCheckMessage("아이디를 입력해주세요.");
      return;
    }
    if (!/^[a-zA-Z0-9._-]{4,30}$/.test(username)) {
      setUsernameChecked(false);
      setUsernameAvailable(null);
      setUsernameCheckMessage("아이디는 영문/숫자/._- 조합 4~30자로 입력해주세요.");
      return;
    }

    try {
      setUsernameCheckLoading(true);
      const available = await checkUsernameAvailabilityApi(username);
      setUsernameChecked(true);
      setUsernameAvailable(available);
      setUsernameCheckMessage(available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.");
    } catch (e) {
      setUsernameChecked(false);
      setUsernameAvailable(null);
      setUsernameCheckMessage(e instanceof Error ? e.message : "아이디 중복 확인에 실패했습니다.");
    } finally {
      setUsernameCheckLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    const email = registerForm.email.trim();
    if (!email) {
      setEmailVerifyMessage("이메일을 입력해주세요.");
      return;
    }
    try {
      setEmailSendLoading(true);
      const message = await sendRegisterEmailCodeApi(email);
      setEmailVerifiedToken("");
      setEmailVerifyMessage(message || "이메일 인증코드를 발송했습니다.");
      setEmailResendSec(60);
      setEmailValidSec(300);
      window.setTimeout(() => emailCodeInputRef.current?.focus(), 50);
    } catch (e) {
      setEmailVerifyMessage(e instanceof Error ? e.message : "이메일 인증코드 발송에 실패했습니다.");
    } finally {
      setEmailSendLoading(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    const email = registerForm.email.trim();
    if (!email || !emailCode.trim()) {
      setEmailVerifyMessage("이메일과 인증코드를 입력해주세요.");
      return;
    }
    try {
      setEmailVerifyLoading(true);
      if (emailValidSec <= 0) {
        setEmailVerifyMessage("인증코드가 만료되었습니다. 코드를 다시 발송해주세요.");
        return;
      }
      const token = await verifyRegisterEmailCodeApi(email, emailCode.trim());
      setEmailVerifiedToken(token);
      setEmailVerifyMessage("이메일 인증이 완료되었습니다.");
    } catch (e) {
      setEmailVerifiedToken("");
      const message = e instanceof Error ? e.message : "이메일 인증 확인에 실패했습니다.";
      if (message.includes("만료")) {
        setEmailVerifyMessage("인증코드가 만료되었습니다. 코드를 다시 발송해주세요.");
      } else if (message.includes("횟수")) {
        setEmailVerifyMessage("인증 시도 횟수를 초과했습니다. 코드를 다시 발송해주세요.");
      } else if (message.includes("올바르지")) {
        setEmailVerifyMessage("인증코드가 올바르지 않습니다. 다시 확인해주세요.");
      } else {
        setEmailVerifyMessage(message);
      }
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  const resetEmailVerification = () => {
    setEmailVerifiedToken("");
    setEmailCode("");
    setEmailVerifyMessage(null);
    setEmailResendSec(0);
    setEmailValidSec(0);
  };

  const closeOnboarding = (markSeen = false) => {
    setOnboardingOpen(false);
    if (markSeen) {
      window.localStorage.setItem(LOGIN_ONBOARDING_SEEN_KEY, "1");
    }
  };

  const emailStepLabel = emailVerifiedToken
    ? "3) 인증 완료"
    : emailCode.trim().length > 0
      ? "2) 코드 확인"
      : "1) 코드 발송";

  const onboardingSteps = [
    {
      title: "1. 로그인 시작",
      body: "아이디/비밀번호로 로그인합니다. 아이디 저장을 체크하면 다음 접속 시 자동으로 채워집니다.",
    },
    {
      title: "2. 회원가입 신청",
      body: "계정이 없으면 회원가입 신청에서 소셜 간편 가입 또는 일반 가입을 선택합니다. 일반 가입은 이메일 인증과 아이디 중복 확인이 필요합니다.",
    },
    {
      title: "3. 관리자 승인 후 사용",
      body: "가입 신청이 완료되면 관리자 승인 전까지 로그인할 수 없습니다. 승인 후 역할에 맞는 화면으로 자동 이동합니다.",
    },
  ] as const;

  const renderOnboardingPreview = () => {
    if (onboardingStep === 0) {
      return (
        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#0f172a", border: "1px solid rgba(148,163,184,0.28)" }}>
          <Typography sx={{ color: "#94a3b8", fontSize: 11, mb: 0.75 }}>로그인 버튼 위치 미리보기</Typography>
          <Stack spacing={0.8}>
            <Box sx={{ height: 28, borderRadius: 1, bgcolor: "rgba(148,163,184,0.16)" }} />
            <Box sx={{ height: 28, borderRadius: 1, bgcolor: "rgba(148,163,184,0.16)" }} />
            <Box sx={{ height: 30, borderRadius: 1, bgcolor: "rgba(96,165,250,0.2)", border: "1px solid #60a5fa", color: "#bfdbfe", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>
              로그인
            </Box>
          </Stack>
        </Box>
      );
    }
    if (onboardingStep === 1) {
      return (
        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#111827", border: "1px solid rgba(148,163,184,0.28)" }}>
          <Typography sx={{ color: "#94a3b8", fontSize: 11, mb: 0.75 }}>회원가입 버튼/인증 버튼 미리보기</Typography>
          <Stack spacing={0.8}>
            <Box sx={{ height: 28, borderRadius: 1, bgcolor: "rgba(148,163,184,0.16)", display: "grid", placeItems: "center", color: "#e2e8f0", fontWeight: 700, fontSize: 12 }}>
              회원가입
            </Box>
            <Stack direction="row" spacing={0.8}>
              <Box sx={{ flex: 1, height: 26, borderRadius: 999, bgcolor: "#03C75A", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 900 }}>N</Box>
              <Box sx={{ flex: 1, height: 26, borderRadius: 999, bgcolor: "#fff", color: "#1f2937", border: "1px solid #d0d7de", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 900 }}>G</Box>
            </Stack>
          </Stack>
        </Box>
      );
    }
    return (
      <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#0f172a", border: "1px solid rgba(148,163,184,0.28)" }}>
        <Typography sx={{ color: "#94a3b8", fontSize: 11, mb: 0.75 }}>승인 상태 안내 미리보기</Typography>
        <Stack spacing={0.8}>
          <Box sx={{ height: 26, borderRadius: 1, bgcolor: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.5)", color: "#fde68a", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>
            가입 승인 대기
          </Box>
          <Box sx={{ height: 26, borderRadius: 1, bgcolor: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.5)", color: "#bbf7d0", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>
            승인 후 로그인 가능
          </Box>
        </Stack>
      </Box>
    );
  };

  const emailValidMinute = String(Math.floor(emailValidSec / 60)).padStart(2, "0");
  const emailValidSecond = String(emailValidSec % 60).padStart(2, "0");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        background: pageBackground,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 520, borderRadius: 3.5, border: cardBorder, bgcolor: cardBg, boxShadow: isDark ? "0 24px 56px rgba(2,6,23,0.55)" : "0 24px 56px rgba(30,64,175,0.18)" }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack spacing={2.25}>
            <Box sx={{ textAlign: "center", pb: 0.5 }}>
              <Box
                component="img"
                src="https://i.namu.wiki/i/sEYQw7GEKz8v1B2DTycSqUXzo-NjjgYnHeJAfJPbrTUlq5c_t47Qr71E0XVU3OCtWGhvO__hlMNJJDWNfA1JZw.svg"
                alt="병원 로고"
                sx={{ width: 120, height: 120, objectFit: "contain", mb: 0.5 }}
              />
              <Typography sx={{ fontSize: 26, fontWeight: 900, letterSpacing: 0.6, color: headingColor }}>
                경상국립대학교병원
              </Typography>
              <Typography sx={{ color: subColor, fontSize: 13 }}>
                의료기관 통합 운영 시스템 로그인
              </Typography>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {registerNotice ? <Alert severity="success">{registerNotice}</Alert> : null}

            <TextField
              label="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              InputLabelProps={{ sx: { color: fieldLabel } }}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: fieldBg, color: fieldText } }}
            />
            <TextField
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              InputLabelProps={{ sx: { color: fieldLabel } }}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: fieldBg, color: fieldText } }}
            />

            <FormControlLabel
              sx={{ mt: -0.5 }}
              control={
                <Checkbox
                  checked={rememberUsername}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRememberUsername(checked);
                    if (!checked) {
                      window.localStorage.removeItem(SAVED_USERNAME_KEY);
                    }
                  }}
                  size="small"
                  sx={{ color: isDark ? "#64748b" : "#475569" }}
                />
              }
              label={<Typography sx={{ color: subColor, fontSize: 13 }}>아이디 저장</Typography>}
            />

            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading || !username || !password}
              sx={{ bgcolor: loginButtonBg, color: "#f8fafc", py: 1.1, fontWeight: 800, "&:hover": { bgcolor: loginButtonHover } }}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>

            <Divider sx={{ borderColor: isDark ? "rgba(148,163,184,0.2)" : "rgba(148,163,184,0.35)", mt: 0.5 }} />

            <Stack spacing={0.7}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ color: isDark ? "#cbd5e1" : "#0f172a", fontSize: 15, fontWeight: 700 }}>아직 회원이 아니신가요?</Typography>
                <Button
                  variant="text"
                  onClick={() => {
                    setRegisterError(null);
                    setRegisterFlow("choice");
                    setUsernameChecked(false);
                    setUsernameAvailable(null);
                    setUsernameCheckMessage(null);
                    setEmailCode("");
                    setEmailVerifiedToken("");
                    setEmailVerifyMessage(null);
                    setEmailResendSec(0);
                    setEmailValidSec(0);
                    setRegisterOpen(true);
                  }}
                  sx={{ color: isDark ? "#93c5fd" : "#2563eb", fontWeight: 800, minWidth: "auto", p: 0 }}
                >
                  회원가입
                </Button>
              </Stack>
              <Typography sx={{ color: subColor, fontSize: 13 }}>
                아이디 또는 비밀번호를 잊어버렸나요? 관리자에게 문의하세요.
              </Typography>
              <Button
                variant="text"
                onClick={() => {
                  setOnboardingStep(0);
                  setOnboardingOpen(true);
                }}
                sx={{ alignSelf: "flex-start", color: isDark ? "#7dd3fc" : "#0369a1", fontWeight: 700, px: 0, minWidth: "auto" }}
              >
                처음 이용하시나요? 1분 온보딩 보기
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          position: "fixed",
          left: 14,
          bottom: 14,
          p: 0.75,
          borderRadius: 999,
          bgcolor: isDark ? "rgba(15,23,42,0.75)" : "rgba(255,255,255,0.82)",
          border: isDark ? "1px solid rgba(148,163,184,0.28)" : "1px solid rgba(148,163,184,0.35)",
          backdropFilter: "blur(8px)",
          zIndex: 1400,
        }}
      >
        <Tooltip title="라이트">
          <IconButton
            size="small"
            onClick={() => setThemeMode("light")}
            sx={{
              bgcolor: themeMode === "light" ? "rgba(245,158,11,0.2)" : "transparent",
              color: isDark ? "#facc15" : "#92400e",
            }}
          >
            <LightModeRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="다크">
          <IconButton
            size="small"
            onClick={() => setThemeMode("dark")}
            sx={{
              bgcolor: themeMode === "dark" ? "rgba(59,130,246,0.18)" : "transparent",
              color: isDark ? "#93c5fd" : "#1e3a8a",
            }}
          >
            <DarkModeRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="시스템">
          <IconButton
            size="small"
            onClick={() => setThemeMode("system")}
            sx={{
              bgcolor: themeMode === "system" ? "rgba(16,185,129,0.2)" : "transparent",
              color: isDark ? "#6ee7b7" : "#065f46",
            }}
          >
            <DesktopWindowsRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Dialog open={onboardingOpen} onClose={() => closeOnboarding(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>HIS 빠른 온보딩</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 0.5 }}>
            <Stack direction="row" spacing={0.75}>
              {onboardingSteps.map((step, idx) => (
                <Chip
                  key={step.title}
                  size="small"
                  label={`${idx + 1}`}
                  color={idx === onboardingStep ? "primary" : "default"}
                  variant={idx === onboardingStep ? "filled" : "outlined"}
                  onClick={() => setOnboardingStep(idx)}
                />
              ))}
            </Stack>
            <Box sx={{ p: 1.25, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(15,23,42,0.03)" }}>
              <Typography sx={{ fontWeight: 800, fontSize: 15 }}>{onboardingSteps[onboardingStep].title}</Typography>
              <Typography sx={{ mt: 0.7, fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                {onboardingSteps[onboardingStep].body}
              </Typography>
            </Box>
            {renderOnboardingPreview()}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => closeOnboarding(true)}>다시 보지 않기</Button>
          <Button onClick={() => closeOnboarding(false)}>닫기</Button>
          {onboardingStep > 0 ? <Button onClick={() => setOnboardingStep((p) => p - 1)}>이전</Button> : null}
          {onboardingStep < onboardingSteps.length - 1 ? (
            <Button variant="contained" onClick={() => setOnboardingStep((p) => p + 1)}>다음</Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                closeOnboarding(true);
                setRegisterError(null);
                setUsernameChecked(false);
                setUsernameAvailable(null);
                setUsernameCheckMessage(null);
                setRegisterOpen(true);
                setRegisterFlow("choice");
              }}
            >
              회원가입 신청하기
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={registerOpen}
        onClose={() => {
          setRegisterOpen(false);
          setRegisterError(null);
          setRegisterFlow("choice");
          setEmailCode("");
          setEmailVerifiedToken("");
          setEmailVerifyMessage(null);
          setEmailResendSec(0);
          setEmailValidSec(0);
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3.5, border: "1px solid var(--line)" } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>회원가입 신청</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 0.25 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              승인 상태 및 가입 관련 문의는 관리자에게 문의하시기 바랍니다.
            </Alert>

            {registerFlow === "choice" ? (
              <Stack spacing={1}>
                <Box sx={{ p: 1.25, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.92)" }}>
                  <Typography sx={{ fontWeight: 900, fontSize: 14 }}>3초만에 로그인하기</Typography>
                  <Typography sx={{ mt: 0.4, fontSize: 12, color: "var(--muted)" }}>
                    소셜 인증 후 아이디/비밀번호만 입력해 빠르게 가입 신청할 수 있습니다.
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1.2 }}>
                    <Stack spacing={0.5} alignItems="center">
                      <Button
                        onClick={() => {
                          setRegisterFlow("social");
                          window.location.href = getRegisterSocialVerifyUrl("naver");
                        }}
                        sx={{
                          minWidth: 0,
                          width: 52,
                          height: 52,
                          borderRadius: 999,
                          bgcolor: "#03C75A",
                          color: "#fff",
                          fontSize: 18,
                          fontWeight: 900,
                          "&:hover": { bgcolor: "#02b450" },
                        }}
                      >
                        N
                      </Button>
                      <Typography sx={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>네이버</Typography>
                    </Stack>
                    <Stack spacing={0.5} alignItems="center">
                      <Button
                        onClick={() => {
                          setRegisterFlow("social");
                          window.location.href = getRegisterSocialVerifyUrl("google");
                        }}
                        sx={{
                          minWidth: 0,
                          width: 52,
                          height: 52,
                          borderRadius: 999,
                          bgcolor: "#fff",
                          color: "#1f2937",
                          border: "1px solid #d0d7de",
                          fontSize: 18,
                          fontWeight: 900,
                          "&:hover": { bgcolor: "#f8fafc" },
                        }}
                      >
                        G
                      </Button>
                      <Typography sx={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>구글</Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Box sx={{ p: 1.25, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.85)" }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 13, mb: 0.8 }}>일반 회원가입</Typography>
                  <Button variant="outlined" onClick={() => setRegisterFlow("basic")} sx={{ py: 1.05, fontWeight: 700 }} fullWidth>
                    일반 회원가입 신청
                  </Button>
                </Box>
              </Stack>
            ) : null}

            {registerFlow === "social" ? (
            <Box sx={{ p: 1.25, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.7)" }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 800, fontSize: 13 }}>소셜 본인인증</Typography>
                  {socialVerified ? <Chip size="small" color="success" label="인증 완료" /> : <Chip size="small" label="미인증" />}
                </Stack>
                {!socialVerified ? (
                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={() => {
                        window.location.href = getRegisterSocialVerifyUrl("naver");
                      }}
                      sx={{
                        minWidth: 0,
                        width: 42,
                        height: 42,
                        borderRadius: 999,
                        bgcolor: "#03C75A",
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: 900,
                        "&:hover": { bgcolor: "#02b450" },
                      }}
                    >
                      N
                    </Button>
                    <Button
                      onClick={() => {
                        window.location.href = getRegisterSocialVerifyUrl("google");
                      }}
                      sx={{
                        minWidth: 0,
                        width: 42,
                        height: 42,
                        borderRadius: 999,
                        bgcolor: "#fff",
                        color: "#1f2937",
                        border: "1px solid #d0d7de",
                        fontSize: 16,
                        fontWeight: 900,
                        "&:hover": { bgcolor: "#f8fafc" },
                      }}
                    >
                      G
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
              <Typography sx={{ mt: 0.75, fontSize: 12, color: "var(--muted)" }}>
                인증 완료 시 아이디/비밀번호만 입력해도 가입 신청이 가능합니다.
              </Typography>
              {socialVerifiedName ? (
                <Typography sx={{ mt: 0.35, fontSize: 12, color: "var(--muted)" }}>
                  인증 이름: {socialVerifiedName}
                </Typography>
              ) : null}
            </Box>
            ) : null}

            {canEditRegisterForm && registerError ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{registerError}</Alert>
            ) : null}

            {registerFlow === "social" && !socialVerified ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                네이버 또는 구글 인증을 완료하면 아이디/비밀번호만 입력해서 가입 신청할 수 있습니다.
              </Alert>
            ) : null}

            {canEditRegisterForm ? (
            <Box sx={{ p: 1.25, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.7)" }}>
              <Typography sx={{ fontWeight: 800, fontSize: 13, mb: 1 }}>기본 정보</Typography>
              <Stack spacing={1}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "flex-start" }}>
                  <TextField
                    label="아이디 *"
                    value={registerForm.username}
                    onChange={(e) => {
                      const next = e.target.value;
                      setRegisterForm((p) => ({ ...p, username: next }));
                      setUsernameChecked(false);
                      setUsernameAvailable(null);
                      setUsernameCheckMessage(null);
                    }}
                    helperText="영문/숫자/._- 조합 4~30자"
                    fullWidth
                    size="small"
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => void handleCheckUsername()}
                    disabled={usernameCheckLoading || !registerForm.username.trim()}
                    sx={{ width: { xs: "100%", sm: 132 }, height: 40, mt: { xs: 0, sm: 0.5 }, whiteSpace: "nowrap" }}
                  >
                    {usernameCheckLoading ? "확인 중..." : "아이디 중복 확인"}
                  </Button>
                </Stack>
                {usernameCheckMessage ? (
                  <Typography sx={{ fontSize: 12, color: usernameAvailable ? "#16a34a" : "#dc2626", mt: -0.5 }}>
                    {usernameCheckMessage}
                  </Typography>
                ) : null}
                {!socialVerified ? (
                  <>
                    <TextField
                      label="이름 *"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm((p) => ({ ...p, fullName: e.target.value }))}
                      helperText="실명 기준으로 입력해주세요"
                      fullWidth
                      size="small"
                    />
                    <Box sx={{ p: 1, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.9)" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 12 }}>이메일 인증</Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Chip size="small" variant="outlined" label={emailStepLabel} />
                          <Chip size="small" color={emailVerifiedToken ? "success" : "default"} label={emailVerifiedToken ? "인증 완료" : "미인증"} />
                          {emailVerifiedToken ? (
                            <Button size="small" variant="text" onClick={resetEmailVerification} sx={{ minWidth: "auto", px: 0.5 }}>
                              재인증
                            </Button>
                          ) : null}
                        </Stack>
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "flex-start" }}>
                        <TextField
                          label="이메일 *"
                          value={registerForm.email}
                          onChange={(e) => {
                            setRegisterForm((p) => ({ ...p, email: e.target.value }));
                            resetEmailVerification();
                          }}
                          placeholder="예: user@example.com"
                          fullWidth
                          size="small"
                          disabled={Boolean(emailVerifiedToken)}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => void handleSendEmailCode()}
                          disabled={Boolean(emailVerifiedToken) || emailSendLoading || emailResendSec > 0 || !registerForm.email.trim()}
                          sx={{ width: { xs: "100%", sm: 132 }, height: 40, mt: { xs: 0, sm: 0.5 }, whiteSpace: "nowrap" }}
                        >
                          {emailSendLoading ? "발송 중..." : emailResendSec > 0 ? `재발송 ${emailResendSec}s` : "코드 발송"}
                        </Button>
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }} sx={{ mt: 1 }}>
                        <TextField
                          size="small"
                          label="6자리 인증코드"
                          inputRef={emailCodeInputRef}
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !emailVerifyLoading && emailCode.trim().length === 6 && !emailVerifiedToken) {
                              e.preventDefault();
                              void handleVerifyEmailCode();
                            }
                          }}
                          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 6, autoComplete: "one-time-code" }}
                          sx={{ minWidth: 170 }}
                          disabled={Boolean(emailVerifiedToken) || emailValidSec <= 0}
                        />
                        <Button
                          size="small"
                          variant={emailVerifiedToken ? "contained" : "outlined"}
                          color={emailVerifiedToken ? "success" : "primary"}
                          onClick={() => void handleVerifyEmailCode()}
                          disabled={Boolean(emailVerifiedToken) || emailVerifyLoading || emailCode.trim().length !== 6 || emailValidSec <= 0}
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {emailVerifyLoading ? "확인 중..." : emailVerifiedToken ? "인증 완료" : "인증 확인"}
                        </Button>
                      </Stack>
                      {emailVerifyMessage ? (
                        <Typography sx={{ mt: 0.75, fontSize: 12, color: emailVerifiedToken ? "#16a34a" : "#dc2626" }}>
                          {emailVerifyMessage}
                        </Typography>
                      ) : (
                        <Typography sx={{ mt: 0.75, fontSize: 12, color: "var(--muted)" }}>
                          {emailValidSec > 0
                            ? `코드 유효시간 ${emailValidMinute}:${emailValidSecond} · 재발송은 60초 후 가능합니다.`
                            : "코드 유효시간이 만료되었습니다. 코드를 다시 발송해주세요."}
                        </Typography>
                      )}
                    </Box>
                    <TextField
                      label="연락처 *"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="예: 010-1234-5678"
                      fullWidth
                      size="small"
                    />
                  </>
                ) : null}
              </Stack>
            </Box>
            ) : null}

            {canEditRegisterForm ? (
            <Box sx={{ p: 1.25, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.7)" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 13 }}>비밀번호 설정</Typography>
                <Chip
                  size="small"
                  label={registerPasswordScore >= 3 ? "안전" : registerPasswordScore >= 2 ? "보통" : "주의"}
                  color={registerPasswordScore >= 3 ? "success" : registerPasswordScore >= 2 ? "warning" : "default"}
                />
              </Stack>
              <Stack spacing={1}>
                <TextField
                  label="비밀번호 *"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="비밀번호 확인 *"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  fullWidth
                  size="small"
                />
                <LinearProgress
                  variant="determinate"
                  value={registerPasswordScoreValue}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "rgba(0,0,0,0.08)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      backgroundColor: registerPasswordScore >= 3 ? "#16a34a" : registerPasswordScore >= 2 ? "#f59e0b" : "#6b7280",
                    },
                  }}
                />
                {passwordValidationTouched && (!registerPasswordLengthOk || !registerPasswordDiffOk || !registerPasswordConfirmOk) ? (
                  <Stack spacing={0.35}>
                    {!registerPasswordLengthOk ? <Typography sx={{ fontSize: 12, color: "#dc2626" }}>- 8자 이상</Typography> : null}
                    {!registerPasswordDiffOk ? <Typography sx={{ fontSize: 12, color: "#dc2626" }}>- 아이디/이름과 다르게 설정</Typography> : null}
                    {!registerPasswordConfirmOk ? <Typography sx={{ fontSize: 12, color: "#dc2626" }}>- 비밀번호 확인 일치</Typography> : null}
                  </Stack>
                ) : null}
              </Stack>
            </Box>
            ) : null}

            {canEditRegisterForm ? (
              <>
                <Divider />
                <FormControlLabel
                  control={<Checkbox checked={registerAgreed} onChange={(e) => setRegisterAgreed(e.target.checked)} />}
                  label={<Typography sx={{ fontSize: 12 }}>가입 신청 후 관리자 승인 전까지 로그인할 수 없음을 확인했습니다.</Typography>}
                />
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setRegisterOpen(false);
              setRegisterError(null);
              setRegisterFlow("choice");
              setUsernameChecked(false);
              setUsernameAvailable(null);
              setUsernameCheckMessage(null);
              setEmailCode("");
              setEmailVerifiedToken("");
              setEmailVerifyMessage(null);
              setEmailResendSec(0);
              setEmailValidSec(0);
            }}
          >
            닫기
          </Button>
          {canEditRegisterForm ? (
            <Button
              variant="contained"
              onClick={handleRegister}
              disabled={
                registerLoading ||
                !registerForm.username.trim() ||
                (!socialVerified && (!registerForm.fullName.trim() || !registerForm.email.trim() || !registerForm.phone.trim() || !emailVerifiedToken)) ||
                !registerAgreed ||
                !usernameChecked ||
                usernameAvailable !== true
              }
            >
            {registerLoading ? "신청 중..." : "가입 신청"}
          </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
