"use client";

import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Chip,
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
  return (
    <MainLayout showSidebar={false}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
            alignItems: "stretch",
          }}
        >
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-1)",
              background:
                "linear-gradient(120deg, rgba(11, 91, 143, 0.18) 0%, rgba(11, 91, 143, 0) 60%)",
            }}
          >
            <CardContent sx={{ p: 3.5 }}>
              <Stack spacing={1.5}>
                <Chip
                  label="Role-based"
                  size="small"
                  sx={{
                    width: "fit-content",
                    bgcolor: "rgba(11, 91, 143, 0.16)",
                    color: "var(--brand-strong)",
                  }}
                />
                <Typography sx={{ fontSize: 24, fontWeight: 900 }}>
                  병원관리 시스템 워크스페이스
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  의사/간호/원무/스탭/관리자 역할에 맞는 첫 화면으로 바로 진입하세요.
                </Typography>
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ mt: 3 }}
              >
                <Button
                  component={Link}
                  href="/reception"
                  variant="contained"
                  sx={{ bgcolor: "var(--brand)", px: 2.5 }}
                >
                  원무 대시보드
                </Button>
                <Button
                  component={Link}
                  href="/doctor"
                  variant="outlined"
                  sx={{ px: 2.5 }}
                >
                  의사 진료화면
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-1)",
              background: "rgba(255,255,255,0.9)",
            }}
          >
            <CardContent sx={{ p: 3.5 }}>
              <Typography sx={{ fontWeight: 800 }}>오늘 운영 요약</Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {[
                  { label: "외래 대기", value: "24명" },
                  { label: "검사 대기", value: "9건" },
                  { label: "보험 미검증", value: "12건" },
                  { label: "장비 점검", value: "CT실 15:00" },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      p: 1.25,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Typography sx={{ color: "var(--muted)" }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 800 }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

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
              sx={{
                borderRadius: 3,
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-1)",
                background: role.tone,
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
                <Button component={Link} href={role.href} size="small" sx={{ mt: 2 }}>
                  열기
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>
    </MainLayout>
  );
}
