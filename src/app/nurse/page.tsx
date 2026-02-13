"use client";

import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";

const TASKS = [
  { title: "바이탈 체크", count: 6, level: "긴급" },
  { title: "처치 준비", count: 4, level: "보통" },
  { title: "검체 이송", count: 2, level: "보통" },
];

const WARD = [
  { room: "A-201", status: "안정", note: "수액 교체" },
  { room: "A-203", status: "관찰", note: "발열 모니터" },
  { room: "B-102", status: "주의", note: "낙상 위험" },
];

const CALLS = [
  { time: "10:10", from: "원무", text: "퇴원 서류 요청" },
  { time: "10:30", from: "검사실", text: "검체 도착 확인" },
  { time: "11:05", from: "의사", text: "처치 보조 필요" },
];

export default function NursePage() {
  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
            background:
              "linear-gradient(120deg, rgba(23, 162, 142, 0.2) 0%, rgba(23, 162, 142, 0) 55%)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  간호 워크스테이션
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  병동/진료지원 업무를 큐 기반으로 처리합니다.
                </Typography>
              </Stack>
              <Button variant="contained" sx={{ bgcolor: "#16a085" }}>
                오늘 업무 시작
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "1.1fr 1.4fr 1.1fr" },
          }}
        >
          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AssignmentTurnedInOutlinedIcon sx={{ color: "#16a085" }} />
                <Typography fontWeight={800}>업무 큐</Typography>
              </Stack>
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                {TASKS.map((t) => (
                  <Box
                    key={t.title}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{t.title}</Typography>
                      <Chip
                        label={t.level}
                        size="small"
                        color={t.level === "긴급" ? "error" : "default"}
                      />
                    </Stack>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                      오늘 {t.count}건
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FavoriteBorderOutlinedIcon sx={{ color: "var(--brand)" }} />
                <Typography fontWeight={800}>바이탈 모니터</Typography>
              </Stack>
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.7)" }}>
                <Typography fontWeight={700}>김메디 (A-203)</Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  체온 37.6 · 맥박 92 · 혈압 118/76
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography fontWeight={700}>주의 환자</Typography>
                <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
                  야간 발열 기록 있음, 4시간 간격 체크 예정
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button variant="contained" sx={{ bgcolor: "var(--brand)" }}>
                  바이탈 입력
                </Button>
                <Button variant="outlined">경과 기록</Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <HotelOutlinedIcon sx={{ color: "var(--accent)" }} />
                <Typography fontWeight={800}>병동 현황</Typography>
              </Stack>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {WARD.map((w) => (
                  <Box
                    key={w.room}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{w.room}</Typography>
                      <Chip label={w.status} size="small" />
                    </Stack>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                      {w.note}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography fontWeight={700}>협업 요청</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {CALLS.map((c) => (
                  <Box
                    key={c.time}
                    sx={{ p: 1.25, borderRadius: 2, bgcolor: "rgba(23, 162, 142, 0.12)" }}
                  >
                    <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                      {c.time} · {c.from}
                    </Typography>
                    <Typography>{c.text}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </MainLayout>
  );
}
