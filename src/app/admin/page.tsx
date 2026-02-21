"use client";

import MainLayout from "@/components/layout/MainLayout";
import { getSessionUser } from "@/lib/session";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Button,
  LinearProgress,
} from "@mui/material";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import * as React from "react";

const KPI = [
  { label: "일일 방문", value: "1,248", unit: "건" },
  { label: "평균 대기", value: "18", unit: "분" },
  { label: "보험 반려", value: "6", unit: "건" },
  { label: "병상 가동률", value: "87", unit: "%" },
];

const COMPLIANCE = [
  { label: "의무기록 미서명", value: 12, total: 40 },
  { label: "권한 변경 요청", value: 7, total: 20 },
  { label: "감사 로그 검토", value: 4, total: 12 },
];

export default function AdminPage() {
  const [now, setNow] = React.useState(() => new Date());
  const [displayName, setDisplayName] = React.useState("선생님");

  React.useEffect(() => {
    const user = getSessionUser();
    if (user?.fullName?.trim()) {
      setDisplayName(user.fullName.trim());
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const dateText = React.useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(now),
    [now]
  );

  const timeText = React.useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now),
    [now]
  );

  const hour = now.getHours() % 12;
  const minute = now.getMinutes();
  const hourDeg = hour * 30 + minute * 0.5;
  const minuteDeg = minute * 6;

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
            background:
              "linear-gradient(120deg, rgba(75, 85, 99, 0.2) 0%, rgba(75, 85, 99, 0) 55%)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  관리자 대시보드
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  운영 KPI와 보안/감사 상태를 한눈에 확인합니다.
                </Typography>
                <Box
                  sx={{
                    mt: 1.5,
                    display: "grid",
                    gap: 0.5,
                    gridTemplateColumns: { xs: "1fr", md: "auto 1fr" },
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      border: "2px solid rgba(75,85,99,0.35)",
                      position: "relative",
                      bgcolor: "rgba(255,255,255,0.65)",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 2,
                        height: 20,
                        bgcolor: "#4b5563",
                        transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
                        transformOrigin: "50% 100%",
                        borderRadius: 999,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 2,
                        height: 28,
                        bgcolor: "#0b5b8f",
                        transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
                        transformOrigin: "50% 100%",
                        borderRadius: 999,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#0b5b8f",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </Box>
                  <Stack spacing={0.25}>
                    <Typography sx={{ fontSize: 13, color: "var(--muted)" }}>{dateText}</Typography>
                    <Typography sx={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.6 }}>{timeText}</Typography>
                    <Typography sx={{ fontSize: 14, color: "var(--muted)" }}>
                      {displayName} 선생님
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                      오늘 하루도 화이팅하세요!
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Button variant="contained" sx={{ bgcolor: "#4b5563" }}>
                리포트 내보내기
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          }}
        >
          {KPI.map((item) => (
            <Card key={item.label} sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 22 }}>
                  {item.value}
                  <Box component="span" sx={{ fontSize: 12, ml: 0.5 }}>
                    {item.unit}
                  </Box>
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
          }}
        >
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <InsightsOutlinedIcon sx={{ color: "var(--brand)" }} />
                <Typography fontWeight={800}>운영 지표</Typography>
              </Stack>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {COMPLIANCE.map((item) => {
                  const pct = Math.round((item.value / item.total) * 100);
                  return (
                    <Box key={item.label}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                          {item.value}/{item.total}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 999,
                          bgcolor: "rgba(11, 91, 143, 0.12)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            bgcolor: "var(--brand)",
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityOutlinedIcon sx={{ color: "var(--accent)" }} />
                <Typography fontWeight={800}>보안 / 감사</Typography>
              </Stack>
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                {[
                  { label: "권한 변경 승인", tag: "승인 필요" },
                  { label: "접속 로그 점검", tag: "오늘" },
                  { label: "개인정보 마스킹", tag: "설정" },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      display: "flex",
                      justifyContent: "space-between",
                      bgcolor: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Typography fontWeight={700}>{item.label}</Typography>
                    <Chip label={item.tag} size="small" />
                  </Box>
                ))}
              </Stack>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                startIcon={<AdminPanelSettingsOutlinedIcon />}
              >
                권한 관리
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </MainLayout>
  );
}
