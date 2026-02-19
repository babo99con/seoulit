"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { fetchEncountersApi, type MedicalEncounter } from "@/lib/medicalEncounterApi";
import {
  listEncounterDrafts,
  listFavoriteDiagnoses,
  saveFavoriteDiagnoses,
  type FavoriteDiagnosis,
} from "@/lib/doctorWorkspaceStore";

const panelSx = {
  borderRadius: 3,
  border: "1px solid var(--line)",
  boxShadow: "var(--shadow-1)",
} as const;

const statusLabel = (value?: string | null) => {
  switch ((value || "").toUpperCase()) {
    case "WAITING":
      return "대기";
    case "IN_PROGRESS":
      return "진료중";
    case "DONE":
      return "완료";
    default:
      return value || "-";
  }
};

const formatTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const isToday = (value?: string | null) => {
  if (!value) return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

export default function DoctorDashboard() {
  const router = useRouter();
  const [rows, setRows] = React.useState<MedicalEncounter[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [favoriteDiagnoses, setFavoriteDiagnoses] = React.useState<FavoriteDiagnosis[]>([]);
  const [newFavoriteCode, setNewFavoriteCode] = React.useState("");
  const [newFavoriteLabel, setNewFavoriteLabel] = React.useState("");
  const [draftVersion, setDraftVersion] = React.useState(0);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const page = await fetchEncountersApi({ includeInactive: false, size: 150, page: 0 });
      setRows(page.items);
    } catch {
      setError("의사 대시보드를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    setFavoriteDiagnoses(listFavoriteDiagnoses());
  }, []);

  const todayQueue = React.useMemo(() => {
    return rows
      .filter((r) => r.isActive === "Y")
      .filter((r) => isToday(r.updatedAt || r.createdAt))
      .filter((r) => {
        const status = (r.status || "").toUpperCase();
        return status === "WAITING" || status === "IN_PROGRESS" || status === "DONE";
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, 8);
  }, [rows]);

  const recentPatients = React.useMemo(() => {
    const seen = new Set<number>();
    const sorted = [...rows].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
    const next: MedicalEncounter[] = [];
    for (const row of sorted) {
      if (seen.has(row.patientId)) continue;
      seen.add(row.patientId);
      next.push(row);
      if (next.length >= 6) break;
    }
    return next;
  }, [rows]);

  const drafts = React.useMemo(() => listEncounterDrafts(), [draftVersion]);

  const totalCount = rows.length;
  const waitingCount = rows.filter((r) => (r.status || "").toUpperCase() === "WAITING").length;
  const inProgressCount = rows.filter((r) => (r.status || "").toUpperCase() === "IN_PROGRESS").length;
  const doneCount = rows.filter((r) => (r.status || "").toUpperCase() === "DONE").length;

  const goEncounter = (encounterId?: number, useDraft?: boolean) => {
    if (!encounterId) {
      router.push("/doctor/encounters");
      return;
    }
    const query = useDraft ? `?encounterId=${encounterId}&restoreDraft=1` : `?encounterId=${encounterId}`;
    router.push(`/doctor/encounters${query}`);
  };

  const addFavorite = () => {
    const code = newFavoriteCode.trim().toUpperCase();
    const label = newFavoriteLabel.trim();
    if (!code || !label) return;
    if (favoriteDiagnoses.some((x) => x.code === code)) return;
    const next = [...favoriteDiagnoses, { code, label }];
    setFavoriteDiagnoses(next);
    saveFavoriteDiagnoses(next);
    setNewFavoriteCode("");
    setNewFavoriteLabel("");
  };

  const removeFavorite = (code: string) => {
    const next = favoriteDiagnoses.filter((x) => x.code !== code);
    setFavoriteDiagnoses(next);
    saveFavoriteDiagnoses(next);
  };

  return (
    <Stack spacing={2.5}>
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card
        sx={{
          ...panelSx,
          background: "linear-gradient(120deg, rgba(0,95,115,0.2) 0%, rgba(0,95,115,0) 60%)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
            <Stack spacing={0.75} sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 22, fontWeight: 900 }}>의사 대시보드</Typography>
              <Typography sx={{ color: "var(--muted)" }}>
                오늘 진료 흐름, 최근 환자, 임시저장 기록을 한 번에 확인합니다.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => goEncounter()}>
                진료 워크스페이스
              </Button>
              <Button variant="outlined" onClick={() => void load()} disabled={loading}>
                새로고침
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
        {[
          { label: "전체", value: `${totalCount}건`, icon: <MedicalServicesRoundedIcon fontSize="small" /> },
          { label: "대기", value: `${waitingCount}건`, icon: <TodayRoundedIcon fontSize="small" /> },
          { label: "진료중", value: `${inProgressCount}건`, icon: <HistoryRoundedIcon fontSize="small" /> },
          { label: "완료", value: `${doneCount}건`, icon: <BookmarkAddedRoundedIcon fontSize="small" /> },
        ].map((item) => (
          <Box key={item.label} sx={{ p: 1.4, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.9)" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ color: "var(--brand)" }}>{item.icon}</Box>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>{item.label}</Typography>
            </Stack>
            <Typography sx={{ mt: 0.5, fontSize: 18, fontWeight: 900 }}>{item.value}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1.3fr 1fr" } }}>
        <Card sx={panelSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontWeight: 800 }}>오늘 진료 목록</Typography>
              <Button size="small" variant="text" onClick={() => goEncounter()}>
                전체 보기
              </Button>
            </Stack>
            <Stack spacing={1} sx={{ mt: 1.25 }}>
              {todayQueue.map((row) => (
                <Box key={row.id} sx={{ p: 1.25, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.88)" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{row.patientName ?? "환자"}</Typography>
                      <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                        #{row.visitId} · {row.patientNo ?? row.patientId} · {formatTime(row.updatedAt || row.createdAt)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Chip size="small" label={statusLabel(row.status)} color={(row.status || "").toUpperCase() === "IN_PROGRESS" ? "primary" : "default"} />
                      <Button size="small" variant="outlined" onClick={() => goEncounter(row.id)}>
                        열기
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}
              {!todayQueue.length && !loading ? (
                <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>오늘 처리된 진료가 아직 없습니다.</Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={panelSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <DescriptionRoundedIcon sx={{ color: "var(--brand)" }} />
              <Typography sx={{ fontWeight: 800 }}>임시저장함</Typography>
            </Stack>
            <Stack spacing={1} sx={{ mt: 1.25 }}>
              {drafts.slice(0, 6).map((draft) => (
                <Box key={draft.encounterId} sx={{ p: 1.2, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.88)" }}>
                  <Typography sx={{ fontWeight: 700 }}>{draft.patientName ?? "환자"}</Typography>
                  <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                    #{draft.encounterId} · {new Date(draft.updatedAt).toLocaleString("ko-KR")}
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
                    <Button size="small" variant="outlined" onClick={() => goEncounter(draft.encounterId, true)}>
                      이어서 작성
                    </Button>
                  </Stack>
                </Box>
              ))}
              {!drafts.length ? (
                <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>임시저장된 진료 기록이 없습니다.</Typography>
              ) : null}
              <Button
                size="small"
                variant="text"
                onClick={() => setDraftVersion((v) => v + 1)}
                sx={{ alignSelf: "flex-start" }}
              >
                임시저장 목록 새로고침
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
        <Card sx={panelSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 800 }}>최근 환자 바로가기</Typography>
            <Stack spacing={1} sx={{ mt: 1.25 }}>
              {recentPatients.map((row) => (
                <Box key={row.id} sx={{ p: 1.25, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.88)" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{row.patientName ?? "환자"}</Typography>
                      <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                        {row.patientNo ?? row.patientId} · 최근 {formatTime(row.updatedAt || row.createdAt)}
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined" onClick={() => goEncounter(row.id)}>
                      차트 열기
                    </Button>
                  </Stack>
                </Box>
              ))}
              {!recentPatients.length && !loading ? (
                <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>최근 환자 데이터가 없습니다.</Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={panelSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 800 }}>즐겨찾는 진단/처방 템플릿</Typography>
            <Typography sx={{ mt: 0.5, color: "var(--muted)", fontSize: 12 }}>
              자주 쓰는 진단 코드를 저장해두고 진료 화면에서 빠르게 붙여 넣을 수 있습니다.
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mt: 1.25 }}>
              <TextField size="small" label="진단코드" placeholder="예: J06.9" value={newFavoriteCode} onChange={(e) => setNewFavoriteCode(e.target.value)} sx={{ minWidth: 120 }} />
              <TextField size="small" label="라벨" placeholder="예: 상기도 감염" value={newFavoriteLabel} onChange={(e) => setNewFavoriteLabel(e.target.value)} fullWidth />
              <Button variant="contained" onClick={addFavorite}>추가</Button>
            </Stack>
            <Divider sx={{ my: 1.25 }} />
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
              {favoriteDiagnoses.map((item) => (
                <Chip
                  key={item.code}
                  label={`${item.code} · ${item.label}`}
                  onDelete={() => removeFavorite(item.code)}
                  sx={{ mb: 0.75 }}
                />
              ))}
              {!favoriteDiagnoses.length ? (
                <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>저장된 즐겨찾기가 없습니다.</Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
