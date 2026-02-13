"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

const ROLES = [
  {
    key: "doctor",
    label: "의사",
    desc: "진료/차트/오더 중심 화면",
    href: "/doctor",
    icon: <LocalHospitalOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(40, 110, 165, 0.22), rgba(40, 110, 165, 0))",
  },
  {
    key: "nurse",
    label: "간호",
    desc: "진료지원, 바이탈, 병동 모니터",
    href: "/nurse",
    icon: <MedicalServicesOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
  },
  {
    key: "staff",
    label: "스탭",
    desc: "스케줄/배정/부서 운영",
    href: "/staff",
    icon: <BadgeOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(24, 90, 158, 0.18), rgba(24, 90, 158, 0))",
  },
  {
    key: "reception",
    label: "원무",
    desc: "접수/수납/보험/환자관리",
    href: "/reception",
    icon: <FactCheckOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(217, 119, 6, 0.22), rgba(217, 119, 6, 0))",
  },
  {
    key: "admin",
    label: "관리자",
    desc: "운영 KPI, 권한, 감사 로그",
    href: "/admin",
    icon: <AdminPanelSettingsOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(75, 85, 99, 0.24), rgba(75, 85, 99, 0))",
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <MainLayout showSidebar={false}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {ROLES.map((role) => (
            <Card
              key={role.key}
              onClick={() => router.push(role.href)}
              sx={{
                borderRadius: 3,
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-1)",
                background: role.tone,
                cursor: "pointer",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.85)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--brand-strong)",
                    mb: 2,
                  }}
                >
                  {role.icon}
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                  {role.label}
                </Typography>
                <Typography
                  sx={{ color: "var(--muted)", mt: 0.5, minHeight: 44 }}
                >
                  {role.desc}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>
    </MainLayout>
  );
}
