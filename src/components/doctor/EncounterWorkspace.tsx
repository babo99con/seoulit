"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  activateEncounterApi,
  deactivateEncounterApi,
  fetchEncounterDetailApi,
  fetchEncounterHistoryApi,
  fetchEncountersApi,
  type MedicalEncounter,
  type MedicalEncounterDetail,
  type MedicalEncounterHistory,
  updateEncounterApi,
} from "@/lib/medicalEncounterApi";

const panelSx = {
  borderRadius: 3,
  border: "1px solid var(--line)",
  boxShadow: "var(--shadow-1)",
} as const;

const fieldLabelMap: Record<string, string> = {
  doctorId: "담당의",
  deptCode: "진료과",
  status: "상태",
  chiefComplaint: "주호소",
  assessment: "평가",
  planNote: "계획",
  diagnosisCode: "진단코드",
  memo: "메모",
  isActive: "활성 여부",
};

const statusLabel = (value?: string | null) => {
  switch ((value || "").toUpperCase()) {
    case "WAITING":
      return "대기";
    case "IN_PROGRESS":
      return "진료중";
    case "DONE":
      return "완료";
    case "INACTIVE":
      return "비활성";
    default:
      return value || "-";
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yy}-${mm}-${dd} ${hh}:${mi}`;
};

type Props = {
  includeInactiveDefault?: boolean;
};

export default function EncounterWorkspace({ includeInactiveDefault = false }: Props) {
  const [rows, setRows] = React.useState<MedicalEncounter[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [keyword, setKeyword] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"LATEST" | "OLDEST">("LATEST");
  const [listTab, setListTab] = React.useState<"ACTIVE" | "INACTIVE">(
    includeInactiveDefault ? "INACTIVE" : "ACTIVE"
  );
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<MedicalEncounterDetail | null>(null);
  const [history, setHistory] = React.useState<MedicalEncounterHistory[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [deactivateOpen, setDeactivateOpen] = React.useState(false);
  const [deactivateReasonCode, setDeactivateReasonCode] = React.useState("MANUAL");
  const [deactivateReasonMemo, setDeactivateReasonMemo] = React.useState("");
  const [detailTab, setDetailTab] = React.useState<"DETAIL" | "HISTORY">("DETAIL");

  const loadList = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const page = await fetchEncountersApi({ keyword, status, includeInactive: true, page: 0, size: 100 });
      setRows(page.items);
      if (!selectedId && page.items.length) {
        setSelectedId(page.items[0].id);
      }
      if (selectedId && !page.items.some((x) => x.id === selectedId)) {
        setSelectedId(page.items[0]?.id ?? null);
      }
    } catch (e) {
      setError("진료 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedId, status]);

  const displayedRows = React.useMemo(() => {
    let filtered = rows.filter((r) => (listTab === "INACTIVE" ? r.isActive !== "Y" : r.isActive === "Y"));
    if (status.trim()) {
      filtered = filtered.filter((r) => (r.status || "").toUpperCase() === status.trim().toUpperCase());
    }
    const sorted = [...filtered].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return sortOrder === "LATEST" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [rows, listTab, status, sortOrder]);

  const activeCount = React.useMemo(() => rows.filter((r) => r.isActive === "Y").length, [rows]);
  const inactiveCount = React.useMemo(() => rows.filter((r) => r.isActive !== "Y").length, [rows]);
  const statusCounts = React.useMemo(() => {
    const base = rows.filter((r) => (listTab === "INACTIVE" ? r.isActive !== "Y" : r.isActive === "Y"));
    const map = new Map<string, number>();
    for (const r of base) {
      const key = (r.status || "-").toUpperCase();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries());
  }, [rows, listTab]);

  const loadDetail = React.useCallback(async (id: number) => {
    try {
      const [d, h] = await Promise.all([
        fetchEncounterDetailApi(id),
        fetchEncounterHistoryApi(id),
      ]);
      setDetail(d);
      setHistory(h);
    } catch {
      setError("진료 상세를 불러오지 못했습니다.");
    }
  }, []);

  React.useEffect(() => {
    loadList();
  }, [loadList]);

  React.useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setHistory([]);
      return;
    }
    loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const saveDetail = async () => {
    if (!detail) return;
    try {
      setSaving(true);
      const updated = await updateEncounterApi(detail.id, {
        doctorId: detail.doctorId,
        deptCode: detail.deptCode,
        status: detail.status,
        chiefComplaint: detail.chiefComplaint,
        assessment: detail.assessment,
        planNote: detail.planNote,
        diagnosisCode: detail.diagnosisCode,
        memo: detail.memo,
        updatedBy: "doctor-ui",
      });
      setDetail(updated);
      await loadList();
      await loadDetail(updated.id);
    } catch {
      setError("진료 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async () => {
    if (!detail) return;
    try {
      setSaving(true);
      const updated = await deactivateEncounterApi(detail.id, {
        reasonCode: deactivateReasonCode,
        reasonMemo: deactivateReasonMemo,
        updatedBy: "doctor-ui",
      });
      setDetail(updated);
      setDeactivateOpen(false);
      setDeactivateReasonMemo("");
      await loadList();
      await loadDetail(updated.id);
    } catch {
      setError("진료 비활성 처리에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const activate = async () => {
    if (!detail) return;
    try {
      setSaving(true);
      const updated = await activateEncounterApi(detail.id, "doctor-ui");
      setDetail(updated);
      await loadList();
      await loadDetail(updated.id);
    } catch {
      setError("진료 활성화에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr" }}>
        <Card sx={panelSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                label="검색"
                placeholder="환자명/등록번호/진단코드"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                fullWidth
              />
              <TextField
                select
                size="small"
                label="정렬"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "LATEST" | "OLDEST")}
                sx={{ width: 130 }}
              >
                <MenuItem value="LATEST">최신순</MenuItem>
                <MenuItem value="OLDEST">오래된순</MenuItem>
              </TextField>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button variant="contained" size="small" onClick={loadList}>
                조회
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography fontWeight={800} sx={{ mb: 1 }}>진료 목록</Typography>

            <Box
              sx={{
                display: "grid",
                gap: 1,
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                mb: 1.25,
              }}
            >
              <Box sx={{ p: 1.1, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.8)" }}>
                <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>전체 진료</Typography>
                <Typography sx={{ fontWeight: 800 }}>{rows.length}건</Typography>
              </Box>
              <Box sx={{ p: 1.1, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(235, 252, 244, 0.9)" }}>
                <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>활성 진료</Typography>
                <Typography sx={{ fontWeight: 800 }}>{activeCount}건</Typography>
              </Box>
              <Box sx={{ p: 1.1, borderRadius: 1.5, border: "1px solid rgba(217, 119, 6, 0.2)", bgcolor: "rgba(255, 247, 237, 0.92)" }}>
                <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>비활성 진료</Typography>
                <Typography sx={{ fontWeight: 800 }}>{inactiveCount}건</Typography>
              </Box>
            </Box>

            <Tabs value={listTab} onChange={(_, v) => setListTab(v)} sx={{ mb: 1 }}>
              <Tab value="ACTIVE" label={`활성 진료(${activeCount})`} />
              <Tab value="INACTIVE" label={`비활성 진료(${inactiveCount})`} />
            </Tabs>
            <Stack direction="row" spacing={0.75} sx={{ mb: 1.25, flexWrap: "wrap" }}>
              <Chip
                size="small"
                label={`전체(${listTab === "INACTIVE" ? inactiveCount : activeCount})`}
                color={status ? "default" : "primary"}
                onClick={() => setStatus("")}
                sx={{ mb: 0.75 }}
              />
              {statusCounts.map(([code, cnt]) => (
                <Chip
                  key={code}
                  size="small"
                  label={`${statusLabel(code)}(${cnt})`}
                  color={status.toUpperCase() === code ? "primary" : "default"}
                  onClick={() => setStatus(code)}
                  sx={{ mb: 0.75 }}
                />
              ))}
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>접수번호</TableCell>
                  <TableCell>환자</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>담당의</TableCell>
                  <TableCell>진료과</TableCell>
                  <TableCell>최종수정</TableCell>
                  <TableCell align="right">상세</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedRows.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    onClick={() => {
                      setSelectedId(r.id);
                      setDetailTab("DETAIL");
                      setDetailOpen(true);
                    }}
                    selected={selectedId === r.id}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>#{r.visitId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{r.patientName ?? "-"}</Typography>
                      <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>{r.patientNo ?? r.patientId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={r.status} color={r.isActive === "Y" ? "primary" : "default"} />
                    </TableCell>
                    <TableCell>{r.doctorId ?? "-"}</TableCell>
                    <TableCell>{r.deptCode ?? "-"}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                        {formatDateTime(r.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(r.id);
                          setDetailTab("DETAIL");
                          setDetailOpen(true);
                        }}
                      >
                        열기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!displayedRows.length && !loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>조회 결과가 없습니다.</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Box>

      <Drawer
        anchor="right"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        ModalProps={{
          BackdropProps: {
            sx: {
              top: { xs: 64, md: 76 },
            },
          },
        }}
        PaperProps={{
          sx: {
            width: { xs: "100%", md: 560 },
            borderLeft: "1px solid var(--line)",
            bgcolor: "#fff",
            top: { xs: 64, md: 76 },
            height: { xs: "calc(100% - 64px)", md: "calc(100% - 76px)" },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--line)",
              px: 2.5,
              py: 1.5,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: 18 }}>{`${detail?.patientName ?? "환자"} 진료 상세`}</Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                {detail?.patientNo ? `등록번호 ${detail.patientNo}` : "진료 상세 정보"}
              </Typography>
            </Box>
            <IconButton onClick={() => setDetailOpen(false)} size="small">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 2.5, overflow: "auto", flex: 1 }}>
          {!detail ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>진료 정보를 불러오는 중입니다.</Typography>
          ) : (
            <Stack spacing={1.75}>
              <Tabs
                value={detailTab}
                onChange={(_, v) => setDetailTab(v)}
                sx={{
                  minHeight: 40,
                  "& .MuiTab-root": { minHeight: 40, fontWeight: 700, fontSize: 13 },
                }}
              >
                <Tab value="DETAIL" label="진료 상세" />
                <Tab value="HISTORY" label={`변경 이력(${history.length})`} />
              </Tabs>

              {detailTab === "DETAIL" ? (
                <>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: "rgba(11,91,143,0.05)",
                    }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                      <Stack spacing={0.25}>
                        <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
                          {detail.patientName ?? "-"} ({detail.patientNo ?? detail.patientId})
                        </Typography>
                        <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                          접수번호 {detail.visitId ?? "-"} · 진료구분 {detail.visitId && detail.visitId > 1 ? "재진" : "초진"} · 담당 원무 {detail.updatedBy ?? detail.createdBy ?? "-"}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Chip size="small" label={statusLabel(detail.status)} color="primary" />
                        <Chip size="small" label={detail.isActive === "Y" ? "활성" : "비활성"} color={detail.isActive === "Y" ? "success" : "default"} />
                        <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>
                          수정 {formatDateTime(detail.updatedAt)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                    {[
                      { label: "담당의", value: detail.doctorId || "-" },
                      { label: "진료과", value: detail.deptCode || "-" },
                      { label: "생성일시", value: formatDateTime(detail.createdAt) },
                      { label: "최종수정", value: formatDateTime(detail.updatedAt) },
                    ].map((meta) => (
                      <Box key={meta.label} sx={{ p: 1.25, borderRadius: 1.5, border: "1px solid var(--line)", bgcolor: "rgba(255,255,255,0.85)" }}>
                        <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>{meta.label}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{meta.value}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                    <Tooltip title="상세 새로고침">
                      <IconButton size="small" onClick={() => selectedId && loadDetail(selectedId)}>
                        <RefreshRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {detail.isActive === "Y" ? (
                      <Tooltip title="비활성 처리">
                        <IconButton size="small" color="warning" onClick={() => setDeactivateOpen(true)}>
                          <BlockRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="활성 복구">
                        <IconButton size="small" color="success" onClick={activate}>
                          <CheckCircleRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>

                  <TextField size="small" label="주호소" value={detail.chiefComplaint ?? ""} onChange={(e) => setDetail({ ...detail, chiefComplaint: e.target.value })} fullWidth multiline minRows={2} placeholder="주증상과 시작 시점, 지속기간을 입력하세요." />
                  <TextField size="small" label="평가" value={detail.assessment ?? ""} onChange={(e) => setDetail({ ...detail, assessment: e.target.value })} fullWidth multiline minRows={2} placeholder="의학적 평가/판단을 입력하세요." />
                  <TextField size="small" label="계획" value={detail.planNote ?? ""} onChange={(e) => setDetail({ ...detail, planNote: e.target.value })} fullWidth multiline minRows={2} placeholder="치료 계획, 추적 계획을 입력하세요." />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField size="small" label="진단코드" value={detail.diagnosisCode ?? ""} onChange={(e) => setDetail({ ...detail, diagnosisCode: e.target.value })} fullWidth placeholder="예: J06.9" />
                    <TextField size="small" label="메모" value={detail.memo ?? ""} onChange={(e) => setDetail({ ...detail, memo: e.target.value })} fullWidth placeholder="추가 메모를 입력하세요." />
                  </Stack>

                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 0.5 }}>
                    <Button variant="contained" onClick={saveDetail} disabled={saving}>수정 저장</Button>
                    {detail.isActive === "Y" ? (
                      <Button variant="outlined" color="warning" onClick={() => setDeactivateOpen(true)} disabled={saving}>
                        비활성 처리
                      </Button>
                    ) : (
                      <Button variant="outlined" color="success" onClick={activate} disabled={saving}>
                        활성 복구
                      </Button>
                    )}
                  </Stack>
                </>
              ) : (
                <Stack spacing={0.75} sx={{ maxHeight: 320, overflow: "auto", pr: 0.5 }}>
                  {history.map((h) => (
                    <Box key={h.id} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "rgba(0,0,0,0.03)", border: "1px solid rgba(15, 23, 42, 0.06)" }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                          {formatDateTime(h.changedAt)}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                          {h.changedBy ?? "-"}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                        {fieldLabelMap[h.fieldName || ""] ?? h.fieldName ?? "-"}
                      </Typography>
                      <Typography sx={{ fontSize: 12 }}>
                        [{h.eventType}] {h.oldValue ?? "-"} {"->"} {h.newValue ?? "-"}
                      </Typography>
                    </Box>
                  ))}
                  {!history.length ? <Typography color="text.secondary">이력이 없습니다.</Typography> : null}
                </Stack>
              )}
            </Stack>
          )}
          </Box>
        </Box>
      </Drawer>

      <Dialog open={deactivateOpen} onClose={() => setDeactivateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>진료 비활성 처리</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              size="small"
              label="사유 코드"
              value={deactivateReasonCode}
              onChange={(e) => setDeactivateReasonCode(e.target.value)}
              fullWidth
            />
            <TextField
              size="small"
              label="사유 메모"
              value={deactivateReasonMemo}
              onChange={(e) => setDeactivateReasonMemo(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateOpen(false)}>취소</Button>
          <Button onClick={deactivate} color="warning" variant="contained" disabled={saving || !deactivateReasonCode.trim()}>
            비활성 처리
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
