"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Stack,
  Drawer,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getSessionUser, type SessionUser } from "@/lib/session";
import { loginApi, logoutApi } from "@/lib/authApi";
import { fetchMyStaffProfileApi } from "@/lib/staffApi";
import { deriveOperationalRole } from "@/lib/roleAccess";
import { saveSession } from "@/lib/session";

const DEV_ROLE_ACCOUNTS = [
  { label: "시스템 관리자", username: "admin", password: "admin1234", role: "ADMIN" },
  { label: "의사", username: "doctor", password: "doctor1234", role: "DOCTOR" },
  { label: "간호사", username: "nurse", password: "nurse1234", role: "NURSE" },
  { label: "일반 직원", username: "reception", password: "reception1234", role: "RECEPTION" },
];

const roleHomePath = (role?: string) => {
  const normalized = (role || "").toUpperCase();
  if (normalized.includes("ADMIN")) return "/";
  if (normalized.includes("DOCTOR")) return "/doctor";
  if (normalized.includes("NURSE")) return "/nurse";
  if (normalized.includes("STAFF")) return "/staff";
  return "/reception";
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [switchAnchor, setSwitchAnchor] = useState<HTMLElement | null>(null);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const quickSwitchEnabled =
    process.env.NEXT_PUBLIC_ENABLE_DEV_SWITCH === "true" ||
    process.env.NODE_ENV !== "production";

  useEffect(() => {
    setSessionUser(getSessionUser());
  }, [pathname]);

  const handleLogout = async () => {
    setAccountDialogOpen(false);
    try {
      await logoutApi();
    } catch {
      // ignore logout API failure and clear local session anyway
    }
    clearSession();
    setSessionUser(null);
    window.location.href = "/login";
  };

  const handleOpenMyAccount = () => {
    setAccountDialogOpen(false);
    router.push("/my_account");
  };

  const handleQuickLogin = async (username: string, password: string) => {
    try {
      setSwitchingRole(username);
      const result = await loginApi({ username, password });
      let resolvedRole = result.user.role;
      if (deriveOperationalRole(result.user.role) === "STAFF") {
        try {
          const profile = await fetchMyStaffProfileApi();
          resolvedRole = deriveOperationalRole(result.user.role, profile.domainRole, profile.positionName, profile.departmentName);
        } catch {
          // ignore and fallback to auth role
        }
      }
      saveSession(result.accessToken, { ...result.user, role: resolvedRole }, {
        passwordChangeRequired: result.passwordChangeRequired,
      });
      setSessionUser({ ...result.user, role: resolvedRole });
      setSwitchAnchor(null);
      if (result.passwordChangeRequired) {
        router.push("/my_account?forcePasswordChange=1");
      } else {
        router.push(roleHomePath(resolvedRole));
      }
      router.refresh();
    } catch {
      window.alert("간이 전환 로그인에 실패했습니다. 로그인 페이지에서 다시 시도해주세요.");
    } finally {
      setSwitchingRole(null);
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "transparent",
        background:
          "linear-gradient(90deg, rgba(11, 91, 143, 0.96) 0%, rgba(10, 62, 98, 0.96) 70%)",
        borderBottom: "1px solid rgba(255,255,255,0.16)",
        backdropFilter: "blur(8px)",
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, md: 76 } }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mr: 3, textDecoration: "none" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" component={Link} href="/" sx={{ textDecoration: "none" }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.16)",
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <MedicalServicesOutlinedIcon sx={{ color: "#fff" }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "#fff", fontWeight: 800, letterSpacing: 0.4 }}
            >
              HIS Workspace
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
              역할 기반 병원관리 시스템
            </Typography>
          </Box>
          </Stack>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonOutlineOutlinedIcon sx={{ color: "#dbe8ff" }} />
            <Typography
              onClick={sessionUser ? () => setAccountDialogOpen(true) : undefined}
              sx={{
                color: "#e8f1ff",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                cursor: sessionUser ? "pointer" : "default",
              }}
            >
              {sessionUser?.fullName ?? "게스트"}
            </Typography>
          </Stack>
          {sessionUser ? (
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Typography
                onClick={handleLogout}
                sx={{ color: "#e8f1ff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                로그아웃
              </Typography>
            </Stack>
          ) : (
            <Typography
              component={Link}
              href="/login"
              sx={{
                color: "#e8f1ff",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              로그인
            </Typography>
          )}
        </Stack>

        <Drawer
          anchor="right"
          open={accountDialogOpen}
          onClose={() => setAccountDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: 2.5 } }}
        >
          <Box sx={{ width: { xs: "100vw", sm: 360 }, p: 2.5 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, mb: 2 }}>내 정보</Typography>
            <Stack spacing={1.25}>
              <Typography sx={{ fontSize: 14 }}>
                이름: <b>{sessionUser?.fullName ?? "-"}</b>
              </Typography>
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                계정 권한: {sessionUser?.role ?? "미인증"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Button onClick={() => setAccountDialogOpen(false)}>닫기</Button>
              <Button variant="outlined" onClick={handleLogout}>로그아웃</Button>
              <Button variant="contained" onClick={handleOpenMyAccount}>프로필 관리</Button>
            </Stack>
          </Box>
        </Drawer>

        <Menu
          anchorEl={switchAnchor}
          open={Boolean(switchAnchor)}
          onClose={() => setSwitchAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {DEV_ROLE_ACCOUNTS.map((account) => (
            <MenuItem
              key={account.username}
              disabled={Boolean(switchingRole)}
              onClick={() => handleQuickLogin(account.username, account.password)}
              sx={{ minWidth: 210, justifyContent: "space-between", gap: 1.5 }}
            >
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{account.label}</Typography>
                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{account.username}</Typography>
              </Box>
              {switchingRole === account.username ? <CircularProgress size={14} /> : null}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
