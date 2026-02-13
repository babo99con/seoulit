"use client";

import * as React from "react";
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
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { fetchStaffListApi } from "@/lib/staffApi";
import type { StaffListItem } from "@/features/staff/staffTypes";

const FALLBACK_STAFFS: StaffListItem[] = [
  { id: 1, fullName: "김스탭", departmentName: "접수", status: "근무중" },
  { id: 2, fullName: "이스탭", departmentName: "진료지원", status: "근무중" },
  { id: 3, fullName: "박스탭", departmentName: "보험", status: "대기" },
];

const REQUESTS = [
  { title: "예약 변경 승인", team: "원무", level: "중요" },
  { title: "신규 계정 발급", team: "관리", level: "일반" },
  { title: "근무 교대 요청", team: "간호", level: "일반" },
];

const FALLBACK_DEPARTMENTS = [
  { label: "원무", count: 6 },
  { label: "진료지원", count: 5 },
  { label: "간호", count: 7 },
];

const toLabel = (value?: string | null) => (value && value.trim() ? value : "기타");

export default function StaffPage() {
  const [staffs, setStaffs] = React.useState<StaffListItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const list = await fetchStaffListApi(true).catch(() => []);
        if (mounted) setStaffs(list);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const displayStaffs = staffs.length ? staffs : FALLBACK_STAFFS;
  const departmentSummary = React.useMemo(() => {
    if (!staffs.length) return FALLBACK_DEPARTMENTS;
    const map = new Map<string, number>();
    for (const s of staffs) {
      const key = toLabel(s.departmentName ?? s.domainRole);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [staffs]);

  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
            background:
              "linear-gradient(120deg, rgba(24, 90, 158, 0.2) 0%, rgba(24, 90, 158, 0) 55%)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  스탭 운영 대시보드
                </Typography>
                <Typography sx={{ color: "var(--muted)" }}>
                  근무 현황과 요청을 빠르게 파악하고 배정합니다.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={loading ? "동기화 중" : `${displayStaffs.length}명`}
                  size="small"
                />
                <Button variant="contained" sx={{ bgcolor: "var(--brand)" }}>
                  근무 배정
                </Button>
              </Stack>
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
                <GroupsOutlinedIcon sx={{ color: "var(--brand)" }} />
                <Typography fontWeight={800}>근무 중 스탭</Typography>
              </Stack>
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                {displayStaffs.map((s) => (
                  <Box
                    key={`${s.id ?? s.fullName ?? "staff"}-${s.username ?? ""}`}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{s.fullName ?? "-"}</Typography>
                      <Chip label={s.status ?? s.statusCode ?? "근무"} size="small" />
                    </Stack>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                      {toLabel(s.departmentName ?? s.domainRole)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BadgeOutlinedIcon sx={{ color: "var(--brand-strong)" }} />
                <Typography fontWeight={800}>요청 처리</Typography>
              </Stack>
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                {REQUESTS.map((r) => (
                  <Box
                    key={r.title}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{r.title}</Typography>
                      <Chip
                        label={r.level}
                        size="small"
                        color={r.level === "중요" ? "error" : "default"}
                      />
                    </Stack>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                      {r.team} 팀
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Button variant="outlined" sx={{ mt: 2 }}>
                요청 전체 보기
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleOutlinedIcon sx={{ color: "var(--accent)" }} />
                <Typography fontWeight={800}>부서별 인원</Typography>
              </Stack>
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                {departmentSummary.map((s) => (
                  <Box
                    key={s.label}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>{s.label}</Typography>
                      <Chip label={`${s.count}명`} size="small" />
                    </Stack>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography fontWeight={700}>다음 체크</Typography>
              <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
                인원 변동 사항을 반영해 배정표를 업데이트하세요.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </MainLayout>
  );
}
