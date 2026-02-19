"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type { Patient } from "@/features/patients/patientTypes";
import type { PatientRestriction } from "@/lib/restrictionApi";
import { fetchPatientRestrictionsApi } from "@/lib/restrictionApi";
import type { PatientFlag } from "@/lib/flagApi";
import { fetchPatientFlagsApi } from "@/lib/flagApi";
import { changePatientStatusApi } from "@/lib/patientApi";
import { fetchCodesApi } from "@/lib/codeApi";
import { createVisitApi } from "@/lib/receptionApi";
import { saveVisitReservationApi } from "@/lib/reservationApi";

function sexLabel(g?: Patient["gender"]) {
  if (g === "M") return "남(M)";
  if (g === "F") return "여(F)";
  return "-";
}

function resolveFileUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base =
    process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL?.trim() ||
    (typeof window !== "undefined"
      ? `${window.location.protocol === "https:" ? "https:" : "http:"}//${window.location.hostname}:8081`
      : "http://127.0.0.1:8081");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function restrictionLabel(type: string) {
  switch (type) {
    case "INFECTION":
      return "감염주의(Infection)";
    case "ALLERGY":
      return "알레르기(Allergy)";
    case "BLACKLIST":
      return "블랙리스트(Blacklist)";
    case "NO_SHOW":
      return "노쇼(No-show)";
    default:
      return type;
  }
}
type FlagOption = { value: string; label: string };

function flagLabel(type: string, options: FlagOption[]) {
  const found = options.find((opt) => opt.value === type);
  return found ? found.label : type;
}

function flagColor(type: string) {
  switch (type) {
    case "VIOLENCE":
      return "error";
    case "INFECTIOUS":
      return "error";
    case "FALL_RISK":
      return "warning";
    case "ALLERGY":
      return "warning";
    case "DNR":
      return "info";
    case "SEIZURE":
      return "warning";
    case "PSYCHIATRIC":
      return "warning";
    case "SPECIAL_CARE":
      return "info";
    default:
      return "default";
  }
}

function buildFlags(
  p: Patient,
  restrictions: PatientRestriction[],
  flags: PatientFlag[],
  flagOptions: FlagOption[]
) {
  const chips: {
    label: string;
    color?: "default" | "warning" | "error" | "info" | "success";
  }[] = [];
  if (p.isVip) {
    chips.push({ label: "VIP", color: "warning" });
  }
  for (const r of restrictions) {
    if (!r.activeYn) continue;
    chips.push({
      label: restrictionLabel(r.restrictionType),
      color: r.restrictionType === "INFECTION" ? "error" : "default",
    });
  }
  for (const f of flags) {
    if (!f.activeYn) continue;
    chips.push({
      label: flagLabel(f.flagType, flagOptions),
      color: flagColor(f.flagType),
    });
  }
  return chips;
}

type StatusOption = { value: string; label: string };

const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
  { value: "OUTPATIENT", label: "외래" },
  { value: "INPATIENT", label: "입원" },
  { value: "DISCHARGED", label: "퇴원" },
  { value: "TRANSFERRED", label: "전원" },
  { value: "DECEASED", label: "사망" },
  { value: "NO_SHOW", label: "노쇼" },
  { value: "INACTIVE", label: "비활성" },
];

function statusLabel(code?: string | null, options?: StatusOption[]) {
  if (!code) return "-";
  const found = options?.find((opt) => opt.value === code);
  if (found) return `${found.label}(${found.value})`;
  switch (code) {
    case "ACTIVE":
      return "활성(ACTIVE)";
    case "OUTPATIENT":
      return "외래(OUTPATIENT)";
    case "INPATIENT":
      return "입원(INPATIENT)";
    case "DISCHARGED":
      return "퇴원(DISCHARGED)";
    case "TRANSFERRED":
      return "전원(TRANSFERRED)";
    case "DECEASED":
      return "사망(DECEASED)";
    case "NO_SHOW":
      return "노쇼(NO_SHOW)";
    case "INACTIVE":
      return "비활성(INACTIVE)";
    default:
      return code ?? "-";
  }
}
function toApiDateTime(value?: string) {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const patientId = Number(params.id);

  const { selected, loading, error } = useSelector(
    (s: RootState) => s.patients
  );
  const p = selected;
  const [restrictions, setRestrictions] = React.useState<PatientRestriction[]>(
    []
  );
  const [flags, setFlags] = React.useState<PatientFlag[]>([]);

  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [statusCode, setStatusCode] = React.useState("");
  const [statusReason, setStatusReason] = React.useState("");
  const [statusChangedBy, setStatusChangedBy] = React.useState("");
  const [statusSaving, setStatusSaving] = React.useState(false);
  const [statusOptions, setStatusOptions] = React.useState<StatusOption[]>(
    DEFAULT_STATUS_OPTIONS
  );
  const [flagOptions, setFlagOptions] = React.useState<FlagOption[]>([]);
  const [vipUpdating, setVipUpdating] = React.useState(false);

  React.useEffect(() => {
    dispatch(patientActions.fetchPatientRequest({ patientId }));
  }, [dispatch, patientId]);

  React.useEffect(() => {
    let mounted = true;
    const loadRestrictions = async () => {
      if (!patientId) return;
      try {
        const res = await fetchPatientRestrictionsApi(patientId);
        if (mounted) setRestrictions(res);
      } catch {
        if (mounted) setRestrictions([]);
      }
    };
    loadRestrictions();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  React.useEffect(() => {
    let mounted = true;
    const loadFlags = async () => {
      if (!patientId) return;
      try {
        const res = await fetchPatientFlagsApi(patientId);
        if (mounted) setFlags(res);
      } catch {
        if (mounted) setFlags([]);
      }
    };
    loadFlags();
    return () => {
      mounted = false;
    };
  }, [patientId]);

  React.useEffect(() => {
    let mounted = true;
    const loadCodes = async () => {
      try {
        const list = await fetchCodesApi("PATIENT_STATUS");
        if (!mounted) return;
        if (list.length) {
          setStatusOptions(list.map((c) => ({ value: c.code, label: c.name })));
        }
      } catch {
        // keep defaults
      }
    };
    loadCodes();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const loadFlagCodes = async () => {
      try {
        const list = await fetchCodesApi("PATIENT_FLAG");
        if (!mounted) return;
        setFlagOptions(list.map((c) => ({ value: c.code, label: c.name })));
      } catch {
        if (mounted) setFlagOptions([]);
      }
    };
    loadFlagCodes();
    return () => {
      mounted = false;
    };
  }, []);

  const addressText = p
    ? `${p.address ?? "-"} ${p.addressDetail ? `(${p.addressDetail})` : ""}`
    : "-";
  const detailRows = [
    { label: "환자ID", value: p?.patientId ?? "-" },
    { label: "성별(Gender)", value: p ? sexLabel(p.gender) : "-" },
    { label: "연락처(Phone)", value: p?.phone ?? "-" },
    { label: "보호자 이름", value: p?.guardianName ?? "-" },
    { label: "보호자 연락처", value: p?.guardianPhone ?? "-" },
    { label: "보호자 관계", value: p?.guardianRelation ?? "-" },
    { label: "내/외국인", value: p?.isForeigner ? "외국인" : "내국인" },
    {
      label: "연락 우선순위",
      value: p?.contactPriority === "GUARDIAN" ? "보호자" : "본인",
    },
    { label: "알레르기/주의사항", value: p?.note ?? "-" },
    { label: "주소(Address)", value: addressText },
    { label: "상태(Status)", value: statusLabel(p?.statusCode, statusOptions) },
  ];

  const onDelete = () => {
    if (!p) return;
    if (!confirm("환자를 비활성 처리할까요?")) return;
    dispatch(patientActions.deletePatientRequest(p.patientId));
    router.replace("/patients");
  };

  const cards = [
    {
      title: "보험(Insurance)",
      desc: "환자 보험 등록/수정",
      href: `/patients/${patientId}/insurances`,
    },
    {
      title: "동의서(Consent)",
      desc: "동의서 등록/파일 관리",
      href: `/patients/${patientId}/consents`,
    },
    {
      title: "메모(Memo)",
      desc: "주의사항/요청사항 기록",
      href: `/patients/${patientId}/memos`,
    },
    {
      title: "제한/주의(Restriction)",
      desc: "제한 상태 관리",
      href: `/patients/${patientId}/restrictions`,
    },
    {
      title: "주의 플래그(Flag)",
      desc: "주의 플래그 관리",
      href: `/patients/${patientId}/flags`,
    },
    {
      title: "정보 변경 이력(Info History)",
      desc: "환자 기본정보 변경 이력",
      href: `/patients/${patientId}/info-history`,
    },
    {
      title: "상태 변경 이력(Status History)",
      desc: "환자 상태 변경 이력",
      href: `/patients/${patientId}/status-history`,
    },
  ];

  const openStatusDialog = () => {
    setStatusCode(p?.statusCode ?? "OUTPATIENT");
    setStatusReason("");
    setStatusChangedBy("");
    setStatusDialogOpen(true);
  };

  const toggleVip = (checked: boolean) => {
    if (!p) return;
    if (!confirm(checked ? "VIP로 지정할까요?" : "VIP 해제할까요?")) return;
    try {
      setVipUpdating(true);
      dispatch(
        patientActions.updatePatientVipRequest({
          patientId: p.patientId,
          isVip: checked,
        })
      );
    } finally {
      setVipUpdating(false);
    }
  };

  const saveStatus = async () => {
    if (!patientId || !statusCode) return;
    try {
      setStatusSaving(true);
      await changePatientStatusApi(patientId, {
        statusCode,
        reason: statusReason.trim() || undefined,
        changedBy: statusChangedBy.trim() || undefined,
      });
      setStatusDialogOpen(false);
      dispatch(patientActions.fetchPatientRequest({ patientId }));
    } finally {
      setStatusSaving(false);
    }
  };

  const [reservationDialogOpen, setReservationDialogOpen] = React.useState(false);
  const [reservationSaving, setReservationSaving] = React.useState(false);
  const [reservationForm, setReservationForm] = React.useState({
    deptCode: "",
    doctorId: "",
    reservationId: "",
    scheduledAt: "",
    arrivalAt: "",
    note: "",
    memo: "",
  });

  const openReservationDialog = () => {
    setReservationForm({
      deptCode: "",
      doctorId: "",
      reservationId: "",
      scheduledAt: "",
      arrivalAt: "",
      note: "",
      memo: "",
    });
    setReservationDialogOpen(true);
  };

  const saveReservation = async () => {
    if (!p) return;
    if (!reservationForm.deptCode.trim()) {
      alert("진료과를 입력해주세요.");
      return;
    }
    if (!reservationForm.scheduledAt) {
      alert("예약 일시는 필수입니다.");
      return;
    }
    try {
      setReservationSaving(true);
      const visit = await createVisitApi({
        patientId: p.patientId,
        patientNo: p.patientNo ?? null,
        patientName: p.name,
        patientPhone: p.phone ?? null,
        visitType: "RESERVATION",
        deptCode: reservationForm.deptCode,
        doctorId: reservationForm.doctorId,
        priorityYn: false,
        memo: reservationForm.memo || null,
        createdBy: "patient-detail",
      });

      await saveVisitReservationApi(visit.id, {
        reservationId: reservationForm.reservationId || null,
        scheduledAt: toApiDateTime(reservationForm.scheduledAt),
        arrivalAt: toApiDateTime(reservationForm.arrivalAt),
        note: reservationForm.note || null,
      });

      setReservationDialogOpen(false);
      alert("예약이 등록되었습니다.");
    } catch (err) {
      alert("예약 등록에 실패했습니다.");
    } finally {
      setReservationSaving(false);
    }
  };

  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid #dbe5f5",
            boxShadow: "0 14px 28px rgba(23, 52, 97, 0.15)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Grid container spacing={3} alignItems="stretch">
              <Grid size={{ xs: 12, md: 3 }}>
                <Box
                  sx={{
                    width: { xs: "100%", sm: 220 },
                    aspectRatio: "3 / 4",
                    borderRadius: 4,
                    border: "1px solid #dbe5f5",
                    boxShadow: "0 10px 22px rgba(23, 52, 97, 0.12)",
                    overflow: "hidden",
                    bgcolor: "#f3f6fb",
                    backgroundImage: p?.photoUrl
                      ? `url(${resolveFileUrl(p.photoUrl)})`
                      : "linear-gradient(135deg, #cfdcf2, #e6eefb)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!p?.photoUrl && (
                    <Typography variant="h3" fontWeight={900} color="white">
                      {p?.name?.slice(0, 1) ?? "?"}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={1.25} sx={{ pt: { md: 0.5 } }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="baseline"
                    sx={{ flexWrap: "wrap" }}
                  >
                    <Typography variant="h4" fontWeight={900}>
                      {p?.name ?? "환자 상세"}
                    </Typography>
                    <Typography color="text.secondary" fontWeight={800}>
                      {p?.patientNo ?? "-"}
                    </Typography>
                    {p && (
                      <Typography color="text.secondary" fontWeight={800}>
                        {sexLabel(p.gender)} 쨌 {p.birthDate ?? "-"}
                      </Typography>
                    )}
                  </Stack>
                  <Typography color="text.secondary" fontWeight={700}>
                    환자 기본 정보를 정확히 확인하세요.
                  </Typography>

                  {p && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(p.isVip)}
                          onChange={(e) => toggleVip(e.target.checked)}
                          disabled={vipUpdating || loading}
                        />
                      }
                      label="VIP"
                    />
                  )}

                  <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                    {detailRows.map((row) => (
                      <Stack
                        key={row.label}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={800}
                          sx={{ minWidth: 72 }}
                        >
                          {row.label}
                        </Typography>
                        <Typography fontWeight={900}>{row.value}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", mt: 0.5 }}
                  >
                    {p &&
                      buildFlags(p, restrictions, flags, flagOptions).map((c) => (
                        <Chip
                          key={c.label}
                          label={c.label}
                          color={c.color ?? "default"}
                          sx={{ fontWeight: 900 }}
                        />
                      ))}
                    {!p && <Chip label={loading ? "로딩..." : "선택 없음"} />}
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Stack
                  spacing={1.5}
                  alignItems={{ xs: "flex-start", md: "flex-end" }}
                >
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<AssignmentIndOutlinedIcon />}
                      onClick={() =>
                        router.push(`/reception?patientId=${patientId}`)
                      }
                    >
                      접수 등록
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<EventAvailableOutlinedIcon />}
                      onClick={openReservationDialog}
                      disabled={!p}
                    >
                      예약 등록
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackOutlinedIcon />}
                      onClick={() => router.back()}
                    >
                      뒤로
                    </Button>
                    {p && (
                      <Button
                        variant="outlined"
                        component={Link}
                        href={`/patients/${p.patientId}/edit`}
                        startIcon={<EditOutlinedIcon />}
                      >
                        수정
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<SwapHorizOutlinedIcon />}
                      onClick={openStatusDialog}
                      disabled={!p}
                    >
                      상태 변경
                    </Button>
                    {p && (
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<BlockOutlinedIcon />}
                        onClick={onDelete}
                      >
                        비활성
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12 }}>
                {error && (
                  <Typography color="error" fontWeight={900} sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          {cards.map((card) => (
            <Grid key={card.title} size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  border: "1px solid var(--line)",
                  bgcolor: "white",
                  boxShadow: "var(--shadow-1)",
                }}
              >
                <Stack spacing={1}>
                  <Typography fontWeight={900}>{card.title}</Typography>
                  <Typography color="text.secondary" fontWeight={700}>
                    {card.desc}
                  </Typography>
                  <Divider />
                  <Button variant="outlined" component={Link} href={card.href}>
                    이동
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>상태 변경</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="상태"
              value={statusCode}
              onChange={(e) => setStatusCode(e.target.value)}
              fullWidth
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="사유"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="변경자"
              value={statusChangedBy}
              onChange={(e) => setStatusChangedBy(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={saveStatus}
            disabled={!statusCode || statusSaving}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={reservationDialogOpen}
        onClose={() => setReservationDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>예약 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="진료과"
              value={reservationForm.deptCode}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  deptCode: e.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="담당의"
              value={reservationForm.doctorId}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  doctorId: e.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="예약 ID"
              value={reservationForm.reservationId}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  reservationId: e.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="예약 일시"
              type="datetime-local"
              value={reservationForm.scheduledAt}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  scheduledAt: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="도착 일시(선택)"
              type="datetime-local"
              value={reservationForm.arrivalAt}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  arrivalAt: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="예약 메모"
              value={reservationForm.note}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="접수 메모(선택)"
              value={reservationForm.memo}
              onChange={(e) =>
                setReservationForm((prev) => ({
                  ...prev,
                  memo: e.target.value,
                }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReservationDialogOpen(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={saveReservation}
            disabled={reservationSaving}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
