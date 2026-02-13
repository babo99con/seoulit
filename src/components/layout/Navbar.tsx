"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Stack,
  Button,
} from "@mui/material";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getSessionUser, type SessionUser } from "@/lib/session";

export default function Navbar() {
  const pathname = usePathname();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setSessionUser(getSessionUser());
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    setSessionUser(null);
    window.location.href = "/login";
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
            <Typography sx={{ color: "#e8f1ff", fontSize: 14, fontWeight: 600 }}>
              {sessionUser?.fullName ?? "게스트"}
            </Typography>
            <Typography sx={{ color: "#cbd9f5", fontSize: 12 }}>
              {sessionUser?.role ?? "미인증"}
            </Typography>
          </Stack>
          {sessionUser ? (
            <Button
              size="small"
              onClick={handleLogout}
              sx={{
                color: "#e8f1ff",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 999,
                px: 1.5,
                bgcolor: "rgba(255,255,255,0.08)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
              }}
            >
              로그아웃
            </Button>
          ) : (
            <Button
              component={Link}
              href="/login"
              size="small"
              sx={{
                color: "#e8f1ff",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 999,
                px: 1.5,
                bgcolor: "rgba(255,255,255,0.08)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
              }}
            >
              로그인
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
