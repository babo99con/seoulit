"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";

import { searchPatientsMultiApi } from "@/lib/patientApi";
import { createVisitApi, updateVisitApi, type VisitRes } from "@/lib/receptionApi";
import type { Patient } from "@/features/patients/patientTypes";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { receptionActions } from "@/features/reception/receptionSlice";

type VisitStatus = "WAITING" | "CALLED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
type VisitType = "OUTPATIENT" | "RESERVATION" | "EMERGENCY" | "INPATIENT";
type ReceptionMode =
  | "OUTPATIENT"
  | "OUTPATIENT_RESERVATION"
  | "INPATIENT"
  | "EMERGENCY";

type Props = {
  mode: ReceptionMode;
  title: string;
};

function statusLabel(s: string) {
  switch (s) {
    case "WAITING":
      return "대기";
    case "CALLED":
      return "호출";
    case "IN_PROGRESS":
      return "진료중";
    case "DONE":
      return "완료";
    case "CANCELLED":
      return "취소";
    default:
      return s || "-";
  }
}

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function toLocalInput(value?: string | null) {
  if (!value) return "";
  if (value.length >= 16) return value.slice(0, 16);
  return value;
}

function toApiDateTime(value?: string) {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}


const panelSx = {
  borderRadius: 3,
  border: "1px solid var(--line)",
  boxShadow: "var(--shadow-1)",
  bgcolor: "rgba(255,255,255,0.9)",
} as const;

const headerSx = {
  ...panelSx,
  background:
    "linear-gradient(120deg, rgba(11, 91, 143, 0.18) 0%, rgba(11, 91, 143, 0) 60%)",
} as const;

export default function ReceptionPage({ mode, title }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    list: visits,
    loading: visitLoading,
    error: visitError,
  } = useSelector((s: RootState) => s.reception);
    const [selectedPatient, setSelectedPatient] =
    React.useState<Patient | null>(null);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [patientLoading, setPatientLoading] = React.useState(false);
  const [patientError, setPatientError] = React.useState<string | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = React.useState(false);
  const [multiName, setMultiName] = React.useState("");
  const [multiBirthDate, setMultiBirthDate] = React.useState("");
  const [multiPhone, setMultiPhone] = React.useState("");

  const runPatientSearch = React.useCallback(async () => {
    const name = multiName.trim();
    const birthDate = multiBirthDate.trim();
    const phone = multiPhone.trim();
    if (!name && !birthDate && !phone) {
      alert("검색 조건을 입력하세요.");
      return;
    }
    try {
      setPatientLoading(true);
      setPatientError(null);
      const res = await searchPatientsMultiApi({
        name: name || undefined,
        birthDate: birthDate || undefined,
        phone: phone || undefined,
      });
      if (res.length === 1) {
        setSelectedPatient(res[0]);
        setPatientSearchOpen(false);
        setPatients(res);
        return;
      }
      setPatients(res);
    } catch (err) {
      setPatientError("검색 중 오류가 발생했습니다.");
    } finally {
      setPatientLoading(false);
    }
  }, [multiName, multiBirthDate, multiPhone]);  const openNewPatient = () => {
    window.open("/patients/new", "_blank");
  };

  const filteredPatients = React.useMemo(() => {
    const name = multiName.trim().toLowerCase();
    const birth = multiBirthDate.trim();
    const phone = multiPhone.trim().toLowerCase();
    if (!name && !birth && !phone) return patients;
    return patients.filter((p) => {
      if (name && !p.name.toLowerCase().includes(name)) return false;
      if (birth && (p.birthDate ?? "") !== birth) return false;
      if (phone && !(p.phone ?? "").toLowerCase().includes(phone)) return false;
      return true;
    });
  }, [multiName, multiBirthDate, multiPhone, patients]);
  const [tab, setTab] = React.useState<VisitStatus | "ALL">("WAITING");
  const [visitKeyword, setVisitKeyword] = React.useState("");
  const [selectedVisit, setSelectedVisit] = React.useState<VisitRes | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    dispatch(receptionActions.fetchVisitsRequest());
  }, [dispatch]);

  const visitsByMode = React.useMemo(() => {
    return visits.filter((v) => {
      if (mode === "OUTPATIENT") return v.visitType === "OUTPATIENT";
      if (mode === "OUTPATIENT_RESERVATION") return v.visitType === "RESERVATION";
      if (mode === "INPATIENT") return v.visitType === "INPATIENT";
      if (mode === "EMERGENCY") return v.visitType === "EMERGENCY";
      return true;
    });
  }, [visits, mode]);

  const counts = React.useMemo(() => {
    const c: Record<VisitStatus, number> = {
      WAITING: 0,
      CALLED: 0,
      IN_PROGRESS: 0,
      DONE: 0,
      CANCELLED: 0,
    };
    for (const v of visitsByMode) {
      if (c[v.status as VisitStatus] !== undefined) {
        c[v.status as VisitStatus] += 1;
      }
    }
    return c;
  }, [visitsByMode]);

  const visitFiltered = React.useMemo(() => {
    let list = [...visitsByMode];

    if (tab !== "ALL") list = list.filter((v) => v.status === tab);

    const k = visitKeyword.trim().toLowerCase();
    if (k) {
      list = list.filter(
        (v) =>
          (v.patientName ?? "").toLowerCase().includes(k) ||
          String(v.patientId ?? "").toLowerCase().includes(k)
      );
    }

    list.sort((a, b) => {
      const pa = a.priorityYn ? 0 : 1;
      const pb = b.priorityYn ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });

    return list;
  }, [visitsByMode, tab, visitKeyword]);

  const openVisitDrawer = (v: VisitRes) => {
    setSelectedVisit(v);
    setDrawerOpen(true);
  };

  const [dept, setDept] = React.useState("");
  const [doctor, setDoctor] = React.useState("");
  const [memo, setMemo] = React.useState("");
  const [priority, setPriority] = React.useState(false);
  const [reservationId, setReservationId] = React.useState("");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [arrivalAt, setArrivalAt] = React.useState("");
  const [reservationNote, setReservationNote] = React.useState("");
  const [wardCode, setWardCode] = React.useState("");
  const [roomNo, setRoomNo] = React.useState("");
  const [bedNo, setBedNo] = React.useState("");
  const [admissionAt, setAdmissionAt] = React.useState("");
  const [inpatientNote, setInpatientNote] = React.useState("");
  const [triageLevel, setTriageLevel] = React.useState("");
  const [ambulanceYn, setAmbulanceYn] = React.useState(false);
  const [traumaYn, setTraumaYn] = React.useState(false);
  const [emergencyNote, setEmergencyNote] = React.useState("");

  const createVisit = async () => {
    if (!selectedPatient) return;
    if (!dept.trim()) {
      alert("진료과를 입력해주세요.");
      return;
    }
    const visitType: VisitType =
      mode === "OUTPATIENT"
        ? "OUTPATIENT"
        : mode === "OUTPATIENT_RESERVATION"
        ? "RESERVATION"
        : mode === "INPATIENT"
        ? "INPATIENT"
        : "EMERGENCY";

    if (mode === "OUTPATIENT_RESERVATION" && !scheduledAt) {
      alert("예약 일시를 입력해주세요.");
      return;
    }
    if (mode === "INPATIENT" && !admissionAt) {
      alert("입원 일시를 입력해주세요.");
      return;
    }
    try {
      const saved = await createVisitApi({
        patientId: selectedPatient.patientId,
        patientNo: selectedPatient.patientNo ?? null,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone ?? null,
        visitType,
        deptCode: dept,
        doctorId: doctor,
        priorityYn: priority,
        memo,
        createdBy: "reception-ui",
      });
      if (mode === "OUTPATIENT_RESERVATION") {
        dispatch(
          receptionActions.saveReservationRequest({
            visitId: saved.id,
            payload: {
              reservationId: reservationId || null,
              scheduledAt: toApiDateTime(scheduledAt),
              arrivalAt: toApiDateTime(arrivalAt),
              note: reservationNote || null,
            },
          })
        );
      }
      if (mode === "INPATIENT") {
        dispatch(
          receptionActions.saveInpatientRequest({
            visitId: saved.id,
            payload: {
              wardCode: wardCode || null,
              roomNo: roomNo || null,
              bedNo: bedNo || null,
              admissionAt: toApiDateTime(admissionAt),
              note: inpatientNote || null,
            },
          })
        );
      }
      if (mode === "EMERGENCY") {
        dispatch(
          receptionActions.saveEmergencyRequest({
            visitId: saved.id,
            payload: {
              triageLevel: triageLevel || null,
              ambulanceYn,
              traumaYn,
              note: emergencyNote || null,
            },
          })
        );
      }
      dispatch(receptionActions.upsertVisit(saved));
      setMemo("");
      setPriority(false);
      setReservationId("");
      setScheduledAt("");
      setArrivalAt("");
      setReservationNote("");
      setWardCode("");
      setRoomNo("");
      setBedNo("");
      setAdmissionAt("");
      setInpatientNote("");
      setTriageLevel("");
      setAmbulanceYn(false);
      setTraumaYn(false);
      setEmergencyNote("");
    } catch (err) {
      alert("접수 등록 중 문제가 발생했습니다.");
    }
  };

  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");

  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editSaving, setEditSaving] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    visitType: "OUTPATIENT" as VisitType,
    deptCode: "",
    doctorId: "",
    memo: "",
    priorityYn: false,
  });

  const applyStatus = async (visit: VisitRes, status: VisitStatus) => {
    try {
      const updated = await updateVisitApi(visit.id, {
        status,
        updatedBy: "reception-ui",
        calledAt: status === "CALLED" ? new Date().toISOString() : undefined,
        startedAt:
          status === "IN_PROGRESS" ? new Date().toISOString() : undefined,
        finishedAt: status === "DONE" ? new Date().toISOString() : undefined,
      });
      dispatch(receptionActions.upsertVisit(updated));
      if (selectedVisit?.id === updated.id) {
        setSelectedVisit(updated);
      }
    } catch (err) {
      alert("상태 변경 중 문제가 발생했습니다.");
    }
  };

  const handleCancel = async () => {
    if (!selectedVisit) return;
    try {
      const updated = await updateVisitApi(selectedVisit.id, {
        status: "CANCELLED",
        cancelledAt: new Date().toISOString(),
        cancelReasonCode: "MANUAL",
        cancelMemo: cancelReason,
        updatedBy: "reception-ui",
      });
      dispatch(receptionActions.upsertVisit(updated));
      if (selectedVisit?.id === updated.id) {
        setSelectedVisit(updated);
      }
      setCancelDialogOpen(false);
      setCancelReason("");
      setDrawerOpen(false);
    } catch (err) {
      alert("접수 취소 중 문제가 발생했습니다.");
    }
  };

  const openEditDialog = (visit: VisitRes) => {
    setEditForm({
      visitType: (visit.visitType as VisitType) ?? "OUTPATIENT",
      deptCode: visit.deptCode ?? "",
      doctorId: visit.doctorId ?? "",
      memo: visit.memo ?? "",
      priorityYn: Boolean(visit.priorityYn),
    });
    setEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedVisit) return;
    try {
      setEditSaving(true);
      const updated = await updateVisitApi(selectedVisit.id, {
        visitType: editForm.visitType,
        deptCode: editForm.deptCode,
        doctorId: editForm.doctorId,
        memo: editForm.memo,
        priorityYn: editForm.priorityYn,
        updatedBy: "reception-ui",
      });
      dispatch(receptionActions.upsertVisit(updated));
      setSelectedVisit(updated);
      setEditDialogOpen(false);
    } catch (err) {
      alert("접수 수정 중 문제가 발생했습니다.");
    } finally {
      setEditSaving(false);
    }
  };

  const deactivateVisit = async () => {
    if (!selectedVisit) return;
    if (!confirm("접수를 비활성 처리할까요?")) return;
    try {
      const updated = await updateVisitApi(selectedVisit.id, {
        status: "CANCELLED",
        cancelledAt: new Date().toISOString(),
        cancelReasonCode: "DEACTIVATE",
        cancelMemo: "비활성 처리",
        updatedBy: "reception-ui",
      });
      dispatch(receptionActions.upsertVisit(updated));
      setSelectedVisit(updated);
    } catch (err) {
      alert("접수 비활성 처리 중 문제가 발생했습니다.");
    }
  };

  const [detailTab, setDetailTab] = React.useState<
    "base" | "reservation" | "emergency" | "inpatient"
  >("base");
  const reservationState = useSelector((s: RootState) => s.reception.reservation);
  const emergencyState = useSelector((s: RootState) => s.reception.emergency);
  const inpatientState = useSelector((s: RootState) => s.reception.inpatient);

  const reservationData =
    selectedVisit?.id != null
      ? reservationState.byVisitId[selectedVisit.id] ?? null
      : null;
  const reservationLoading = reservationState.loading;
  const reservationError = reservationState.error;

  const emergencyData =
    selectedVisit?.id != null
      ? emergencyState.byVisitId[selectedVisit.id] ?? null
      : null;
  const emergencyLoading = emergencyState.loading;
  const emergencyError = emergencyState.error;

  const inpatientData =
    selectedVisit?.id != null
      ? inpatientState.byVisitId[selectedVisit.id] ?? null
      : null;
  const inpatientLoading = inpatientState.loading;
  const inpatientError = inpatientState.error;
  const [reservationForm, setReservationForm] = React.useState({
    reservationId: "",
    scheduledAt: "",
    arrivalAt: "",
    note: "",
  });

  React.useEffect(() => {
    if (drawerOpen && selectedVisit?.id) {
      dispatch(receptionActions.fetchReservationRequest({ visitId: selectedVisit.id }));
    }
  }, [drawerOpen, selectedVisit?.id, dispatch]);

  React.useEffect(() => {
    if (selectedVisit?.id == null) return;
    setReservationForm({
      reservationId: reservationData?.reservationId ?? "",
      scheduledAt: toLocalInput(reservationData?.scheduledAt ?? ""),
      arrivalAt: toLocalInput(reservationData?.arrivalAt ?? ""),
      note: reservationData?.note ?? "",
    });
  }, [reservationData, selectedVisit?.id]);

  const [emergencyForm, setEmergencyForm] = React.useState({
    triageLevel: "",
    ambulanceYn: false,
    traumaYn: false,
    note: "",
  });

  React.useEffect(() => {
    if (drawerOpen && selectedVisit?.id && selectedVisit.visitType === "EMERGENCY") {
      dispatch(receptionActions.fetchEmergencyRequest({ visitId: selectedVisit.id }));
    }
  }, [drawerOpen, selectedVisit?.id, selectedVisit?.visitType, dispatch]);

  React.useEffect(() => {
    if (selectedVisit?.visitType !== "EMERGENCY") return;
    setEmergencyForm({
      triageLevel: emergencyData?.triageLevel ?? "",
      ambulanceYn: Boolean(emergencyData?.ambulanceYn),
      traumaYn: Boolean(emergencyData?.traumaYn),
      note: emergencyData?.note ?? "",
    });
  }, [emergencyData, selectedVisit?.visitType, selectedVisit?.id]);

  const saveEmergency = async () => {
    if (!selectedVisit) return;
    dispatch(
      receptionActions.saveEmergencyRequest({
        visitId: selectedVisit.id,
        payload: {
          triageLevel: emergencyForm.triageLevel || null,
          ambulanceYn: emergencyForm.ambulanceYn,
          traumaYn: emergencyForm.traumaYn,
          note: emergencyForm.note || null,
        },
      })
    );
  };

  const deleteEmergency = async () => {
    if (!selectedVisit) return;
    if (!confirm("응급 정보를 삭제할까요?")) return;
    dispatch(receptionActions.deleteEmergencyRequest({ visitId: selectedVisit.id }));
    setEmergencyForm({
      triageLevel: "",
      ambulanceYn: false,
      traumaYn: false,
      note: "",
    });
  };

  const [inpatientForm, setInpatientForm] = React.useState({
    wardCode: "",
    roomNo: "",
    bedNo: "",
    admissionAt: "",
    note: "",
  });

  React.useEffect(() => {
    if (drawerOpen && selectedVisit?.id && selectedVisit.visitType === "INPATIENT") {
      dispatch(receptionActions.fetchInpatientRequest({ visitId: selectedVisit.id }));
    }
  }, [drawerOpen, selectedVisit?.id, selectedVisit?.visitType, dispatch]);

  React.useEffect(() => {
    if (selectedVisit?.visitType !== "INPATIENT") return;
    setInpatientForm({
      wardCode: inpatientData?.wardCode ?? "",
      roomNo: inpatientData?.roomNo ?? "",
      bedNo: inpatientData?.bedNo ?? "",
      admissionAt: toLocalInput(inpatientData?.admissionAt ?? ""),
      note: inpatientData?.note ?? "",
    });
  }, [inpatientData, selectedVisit?.visitType, selectedVisit?.id]);

  const saveInpatient = async () => {
    if (!selectedVisit) return;
    if (!inpatientForm.admissionAt) {
      alert("입원 일시를 입력해주세요.");
      return;
    }
    dispatch(
      receptionActions.saveInpatientRequest({
        visitId: selectedVisit.id,
        payload: {
          wardCode: inpatientForm.wardCode || null,
          roomNo: inpatientForm.roomNo || null,
          bedNo: inpatientForm.bedNo || null,
          admissionAt: toApiDateTime(inpatientForm.admissionAt),
          note: inpatientForm.note || null,
        },
      })
    );
  };

  const deleteInpatient = async () => {
    if (!selectedVisit) return;
    if (!confirm("입원 정보를 삭제할까요?")) return;
    dispatch(receptionActions.deleteInpatientRequest({ visitId: selectedVisit.id }));
    setInpatientForm({
      wardCode: "",
      roomNo: "",
      bedNo: "",
      admissionAt: "",
      note: "",
    });
  };

  const saveReservation = async () => {
    if (!selectedVisit) return;
    if (!reservationForm.scheduledAt) {
      alert("예약 일시를 입력해주세요.");
      return;
    }
    dispatch(
      receptionActions.saveReservationRequest({
        visitId: selectedVisit.id,
        payload: {
          reservationId: reservationForm.reservationId || null,
          scheduledAt: toApiDateTime(reservationForm.scheduledAt),
          arrivalAt: toApiDateTime(reservationForm.arrivalAt),
          note: reservationForm.note || null,
        },
      })
    );
  };

  const deleteReservation = async () => {
    if (!selectedVisit) return;
    if (!confirm("예약 정보를 삭제할까요?")) return;
    dispatch(receptionActions.deleteReservationRequest({ visitId: selectedVisit.id }));
    setReservationForm({
      reservationId: "",
      scheduledAt: "",
      arrivalAt: "",
      note: "",
    });
  };

  return (
    <MainLayout>
      <Box sx={{ p: 0 }}>
        {mode === "OUTPATIENT" ? (
          <Paper elevation={0} sx={{ ...headerSx, p: 3, mb: 2 }}>
            <Typography variant="h5" fontWeight={900}>
              원무 워크스테이션
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              접수/예약/응급/입원 업무를 원무 모듈에서 관리합니다.
            </Typography>
          </Paper>
        ) : null}

        <Paper elevation={0} sx={{ ...panelSx, p: 2, mb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography fontWeight={900} sx={{ mb: 0.5 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                오늘 날짜: {todayStr()}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => dispatch(receptionActions.fetchVisitsRequest())}
                title="대기 목록 새로고침"
              >
                <RefreshIcon />
              </IconButton>
            </Stack>
          </Stack>
            </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper elevation={0} sx={{ ...panelSx, p: 2 }}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>
                환자 검색/선택
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={() => setPatientSearchOpen(true)}
                  fullWidth
                >
                  환자 검색 열기
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ ...panelSx, p: 2 }}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>
                접수 정보 입력
              </Typography>

              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  선택 환자
                </Typography>
                <Typography fontWeight={900}>
                  {selectedPatient
                    ? `${selectedPatient.name} (${selectedPatient.patientNo ?? "-"})`
                    : "환자를 선택해주세요."}
                </Typography>
              </Paper>

              <Stack spacing={2}>
                {mode === "EMERGENCY" ? (
                  <Alert severity="info">
                    응급 접수는 진료정보 입력을 우선으로 진행해주세요.
                  </Alert>
                ) : null}

                <TextField
                  size="small"
                  label="진료과"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  fullWidth
                />

                <TextField
                  size="small"
                  label="담당의"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  fullWidth
                />

                {mode === "OUTPATIENT_RESERVATION" ? (
                  <Stack spacing={2}>
                    <TextField
                      size="small"
                      label="예약 ID"
                      value={reservationId}
                      onChange={(e) => setReservationId(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="예약 일시"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="도착 일시(옵션)"
                      type="datetime-local"
                      value={arrivalAt}
                      onChange={(e) => setArrivalAt(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="예약 메모"
                      value={reservationNote}
                      onChange={(e) => setReservationNote(e.target.value)}
                      fullWidth
                    />
                  </Stack>
                ) : null}

                {mode === "INPATIENT" ? (
                  <Stack spacing={2}>
                    <TextField
                      size="small"
                      label="입원 일시"
                      type="datetime-local"
                      value={admissionAt}
                      onChange={(e) => setAdmissionAt(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="병동 코드"
                      value={wardCode}
                      onChange={(e) => setWardCode(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="병실 번호"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="병상 번호"
                      value={bedNo}
                      onChange={(e) => setBedNo(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="입원 메모"
                      value={inpatientNote}
                      onChange={(e) => setInpatientNote(e.target.value)}
                      fullWidth
                    />
                  </Stack>
                ) : null}

                {mode === "EMERGENCY" ? (
                  <Stack spacing={2}>
                    <TextField
                      size="small"
                      label="트리아지 (Triage)"
                      value={triageLevel}
                      onChange={(e) => setTriageLevel(e.target.value)}
                      fullWidth
                    />
                    <Stack direction="row" spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={ambulanceYn}
                            onChange={(e) => setAmbulanceYn(e.target.checked)}
                          />
                        }
                        label="구급차"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={traumaYn}
                            onChange={(e) => setTraumaYn(e.target.checked)}
                          />
                        }
                        label="외상"
                      />
                    </Stack>
                    <TextField
                      size="small"
                      label="응급 메모"
                      value={emergencyNote}
                      onChange={(e) => setEmergencyNote(e.target.value)}
                      fullWidth
                    />
                  </Stack>
                ) : null}

                <TextField
                  size="small"
                  label="접수 메모"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="증상 요약, 특이사항 등"
                  fullWidth
                />

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip
                    clickable
                    variant={priority ? "filled" : "outlined"}
                    label={priority ? "우선 진료 ON" : "우선 진료 OFF"}
                    onClick={() => setPriority((p) => !p)}
                  />
                  <Typography variant="body2" color="text.secondary">
                    우선 진료는 대기 목록 상단에 표시됩니다.
                  </Typography>
                </Stack>

                <Button variant="contained" disabled={!selectedPatient} onClick={createVisit}>
                  접수 등록
                </Button>

                {!selectedPatient ? (
                  <Typography variant="caption" color="text.secondary">
                    * 환자를 선택해야 접수 등록이 가능합니다.
                  </Typography>
                ) : null}
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ ...panelSx, p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography fontWeight={900}>오늘 접수 현황</Typography>

                <TextField
                  value={visitKeyword}
                  onChange={(e) => setVisitKeyword(e.target.value)}
                  size="small"
                  placeholder="환자명/ID 검색"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {visitError ? (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {visitError}
                </Alert>
              ) : null}

              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 1 }}
              >
                <Tab value="WAITING" label={`대기(${counts.WAITING})`} />
                <Tab value="CALLED" label={`호출(${counts.CALLED})`} />
                <Tab value="IN_PROGRESS" label={`진료중(${counts.IN_PROGRESS})`} />
                <Tab value="DONE" label={`완료(${counts.DONE})`} />
                <Tab value="CANCELLED" label={`취소(${counts.CANCELLED})`} />
                <Tab value="ALL" label="전체" />
              </Tabs>

              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 640 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>시간</TableCell>
                      <TableCell>환자</TableCell>
                      <TableCell>진료과</TableCell>
                      <TableCell>상태</TableCell>
                      <TableCell align="right">조치</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {visitFiltered.map((v) => (
                    <TableRow
                      key={v.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => openVisitDrawer(v)}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">{formatTime(v.createdAt)}</Typography>
                          {v.priorityYn ? <Chip size="small" label="우선" /> : null}
                        </Stack>
                      </TableCell>
                      <TableCell>{v.patientName ?? "-"}</TableCell>
                      <TableCell>{v.deptCode}</TableCell>
                      <TableCell>
                        <Chip size="small" label={statusLabel(v.status)} />
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {v.status === "WAITING" ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => applyStatus(v, "CALLED")}
                            >
                              호출
                            </Button>
                          ) : null}
                          {v.status === "CALLED" ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => applyStatus(v, "IN_PROGRESS")}
                            >
                              진료중
                            </Button>
                          ) : null}
                          {v.status === "IN_PROGRESS" ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => applyStatus(v, "DONE")}
                            >
                              완료
                            </Button>
                          ) : null}
                          {v.status !== "DONE" && v.status !== "CANCELLED" ? (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => {
                                setSelectedVisit(v);
                                setCancelDialogOpen(true);
                              }}
                            >
                              취소
                            </Button>
                          ) : null}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                    {!visitLoading && visitFiltered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography variant="body2" color="text.secondary">
                            검색 조건에 맞는 접수 내역이 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        <Dialog
          open={patientSearchOpen}
          onClose={() => setPatientSearchOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>환자 검색</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField
                  label="이름"
                  size="small"
                  value={multiName}
                  onChange={(e) => setMultiName(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="생년월일"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={multiBirthDate}
                  onChange={(e) => setMultiBirthDate(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="연락처"
                  size="small"
                  value={multiPhone}
                  onChange={(e) => setMultiPhone(e.target.value)}
                  fullWidth
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={runPatientSearch}>
                  검색
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setMultiName("");
                    setMultiBirthDate("");
                    setMultiPhone("");
                    setPatients([]);
                  }}
                >
                  초기화
                </Button>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  환자 목록 ({filteredPatients.length})
                </Typography>
                <Button size="small" onClick={runPatientSearch} disabled={patientLoading}>
                  다시 검색
                </Button>
              </Stack>
              {patientError ? <Alert severity="error">{patientError}</Alert> : null}
              {!patientLoading && filteredPatients.length === 0 ? (
                <Stack spacing={1} sx={{ py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    검색 결과가 없습니다. 신규 환자로 등록할까요?
                  </Typography>
                  <Button size="small" variant="outlined" onClick={openNewPatient}>
                    신규 등록
                  </Button>
                </Stack>
              ) : null}
              <List dense disablePadding>
                {filteredPatients.map((p) => (
                  <React.Fragment key={p.patientId}>
                    <ListItemButton
                      selected={selectedPatient?.patientId === p.patientId}
                      onClick={() => {
                        setSelectedPatient(p);
                        setPatientSearchOpen(false);
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemText
                        primary={`${p.name} (${p.patientNo ?? "-"})`}
                        secondary={`${p.birthDate ?? "-"} / ${p.phone ?? "-"}`}
                      />
                    </ListItemButton>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPatientSearchOpen(false)}>닫기</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>접수 취소</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="취소 사유"
              fullWidth
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="예: 중복 접수 / 환자 요청 / 기타"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>닫기</Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleCancel}
              disabled={!cancelReason.trim()}
            >
              확인
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>접수 수정</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>접수 유형</InputLabel>
                <Select
                  value={editForm.visitType}
                  label="접수 유형"
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      visitType: e.target.value as VisitType,
                    }))
                  }
                >
                  <MenuItem value="OUTPATIENT">외래</MenuItem>
                  <MenuItem value="RESERVATION">예약</MenuItem>
                  <MenuItem value="EMERGENCY">응급</MenuItem>
                  <MenuItem value="INPATIENT">입원</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="진료과"
                value={editForm.deptCode}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, deptCode: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="담당의"
                value={editForm.doctorId}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, doctorId: e.target.value }))
                }
                fullWidth
              />

              {editForm.visitType === "RESERVATION" ? (
                <Alert severity="info">
                  예약 상세는 예약 탭에서 수정해주세요.
                </Alert>
              ) : null}

              <TextField
                label="메모"
                value={editForm.memo}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, memo: e.target.value }))
                }
                fullWidth
                multiline
                minRows={2}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.priorityYn}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        priorityYn: e.target.checked,
                      }))
                    }
                  />
                }
                label="우선 진료"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>닫기</Button>
            <Button variant="contained" onClick={saveEdit} disabled={editSaving}>
              저장
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}

































