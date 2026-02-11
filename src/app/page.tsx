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
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

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
    desc: "처치/바이탈/병동 모니터링",
    href: "/nurse",
    icon: <MedicalServicesOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(23, 162, 142, 0.22), rgba(23, 162, 142, 0))",
  },
  {
    key: "reception",
    label: "접수",
    desc: "초진 등록/접수/예약",
    href: "/reception",
    icon: <FactCheckOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(217, 119, 6, 0.22), rgba(217, 119, 6, 0))",
  },
  {
    key: "billing",
    label: "수납",
    desc: "수납/결제/보험 처리",
    href: "/billing",
    icon: <MonetizationOnOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(245, 158, 11, 0))",
  },
  {
    key: "patients",
    label: "환자",
    desc: "환자 목록/상세/기록",
    href: "/patients",
    icon: <PersonSearchOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0))",
  },
  {
    key: "staff",
    label: "스탭",
    desc: "직원/근무/권한 배정",
    href: "/staff",
    icon: <BadgeOutlinedIcon />,
    tone:
      "linear-gradient(135deg, rgba(24, 90, 158, 0.18), rgba(24, 90, 158, 0))",
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
                  label="Role-based Workspace"
                  size="small"
                  sx={{
                    width: "fit-content",
                    bgcolor: "rgba(11, 91, 143, 0.16)",
                    color: "var(--brand-strong)",
                  }}
                />
                <Typography sx={{ fontSize: 24, fontWeight: 900 }}>
                  병원 업무 대시보드
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  의사/간호/접수/수납/환자/스탭/관리자 역할별 화면으로 바로
                  진입하세요.
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
                  접수 대시보드
                </Button>
                <Button
                  component={Link}
                  href="/patients"
                  variant="outlined"
                  sx={{ px: 2.5 }}
                >
                  환자 관리
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
              <Typography sx={{ fontWeight: 800 }}>오늘 업무 요약</Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {[
                  { label: "외래 대기", value: "24명" },
                  { label: "검사 대기", value: "9건" },
                  { label: "보험 미인증", value: "12건" },
                  { label: "특이 알림", value: "CT 예정 15:00" },
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
                  가기
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>
    </MainLayout>
  );
}
