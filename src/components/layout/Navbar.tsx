"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Stack,
  Badge,
  Button,
  Chip,
} from "@mui/material";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "원무", icon: <DashboardOutlinedIcon fontSize="small" />, href: "/reception" },
  { label: "환자", icon: <PersonSearchOutlinedIcon fontSize="small" />, href: "/patients" },
  { label: "진료", icon: <LocalHospitalOutlinedIcon fontSize="small" />, href: "/doctor" },
  { label: "스탭", icon: <BadgeOutlinedIcon fontSize="small" />, href: "/staff" },
  { label: "관리", icon: <DescriptionOutlinedIcon fontSize="small" />, href: "/admin" },
];

const ROLE_LINKS = [
  { key: "doctor", label: "의사", href: "/doctor" },
  { key: "nurse", label: "간호", href: "/nurse" },
  { key: "staff", label: "스탭", href: "/staff" },
  { key: "reception", label: "원무", href: "/reception" },
  { key: "admin", label: "관리", href: "/admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const activeRole = ROLE_LINKS.find((role) => pathname.startsWith(role.href));

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
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mr: 3 }}>
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

        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
          {NAV_ITEMS.map((item) => {
            const button = (
              <Button
                key={item.label}
                size="small"
                startIcon={item.icon}
                sx={{
                  color: "#e8f1ff",
                  borderRadius: 999,
                  px: 1.5,
                  border: "1px solid rgba(255,255,255,0.2)",
                  bgcolor: "rgba(255,255,255,0.08)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
                }}
              >
                {item.label}
              </Button>
            );

            return (
              <Box
                key={item.label}
                component={Link}
                href={item.href}
                sx={{ textDecoration: "none" }}
              >
                {button}
              </Box>
            );
          })}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mr: 2 }}>
          {ROLE_LINKS.map((role) => (
            <Button
              key={role.key}
              component={Link}
              href={role.href}
              size="small"
              sx={{
                color: "#fff",
                borderRadius: 999,
                px: 1.5,
                border: "1px solid rgba(255,255,255,0.2)",
                bgcolor:
                  activeRole?.key === role.key
                    ? "rgba(255,255,255,0.28)"
                    : "rgba(255,255,255,0.08)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                fontWeight: 700,
              }}
            >
              {role.label}
            </Button>
          ))}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label={activeRole ? `${activeRole.label} 모드` : "역할 선택"}
            size="small"
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.2)",
              fontWeight: 700,
            }}
          />
          <IconButton sx={{ color: "#dbe8ff" }}>
            <Badge color="error" variant="dot">
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonOutlineOutlinedIcon sx={{ color: "#dbe8ff" }} />
            <Typography sx={{ color: "#e8f1ff", fontSize: 14, fontWeight: 600 }}>
              관리자
            </Typography>
            <Typography sx={{ color: "#cbd9f5", fontSize: 12 }}>
              원무과
            </Typography>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
