"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { usePathname } from "next/navigation";
import { fetchMyStaffProfileApi, fetchStaffListApi } from "@/lib/staffApi";
import { deriveOperationalRole, normalizeRole } from "@/lib/roleAccess";
import { getSessionUser } from "@/lib/session";
import { fetchApprovedLeavesApi } from "@/lib/leaveApi";
import { createShiftAssignmentApi, fetchShiftAssignmentsApi } from "@/lib/shiftApi";
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
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

type ShiftType = "DAY" | "NIGHT";

type ShiftEntry = {
  id: string;
  date: string;
  staffId: string;
  staffName: string;
  dept: string;
  shiftType: ShiftType;
};

type ApprovedLeave = {
  requesterId: string;
  requesterName: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
};

type StaffOption = { id: string; name: string; dept: string; role: string; positionName: string; rank: number };

const SHIFT_QUERY_FROM = "2000-01-01";
const SHIFT_QUERY_TO = "2099-12-31";

const FALLBACK_STAFF_OPTIONS: StaffOption[] = [
  { id: "doctor", name: "진료의 김담당", dept: "내과", role: "DOCTOR", positionName: "의사", rank: 5 },
  { id: "nurse", name: "간호사 이담당", dept: "간호부", role: "NURSE", positionName: "간호사", rank: 7 },
];

const fmtDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (d: Date, days: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfWeek = (d: Date) => {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  next.setDate(next.getDate() - next.getDay());
  return next;
};

const dateBetween = (target: string, from: string, to: string) => target >= from && target <= to;

const inferRank = (positionName?: string | null) => {
  const p = (positionName || "").toLowerCase();
  if (p.includes("원장") || p.includes("대표")) return 1;
  if (p.includes("부장")) return 2;
  if (p.includes("팀장")) return 3;
  if (p.includes("과장")) return 4;
  if (p.includes("차장")) return 5;
  if (p.includes("대리")) return 6;
  if (p.includes("주임")) return 7;
  return 8;
};

const buildWindowCells = (start: Date) => {
  const cells: Array<{ date: string; day: number; isToday: boolean }> = [];
  for (let i = 0; i < 35; i += 1) {
    const d = addDays(start, i);
    cells.push({
      date: fmtDate(d),
      day: d.getDate(),
      isToday: fmtDate(d) === fmtDate(new Date()),
    });
  }
  return cells;
};

export default function BoardShiftsPage() {
  const pathname = usePathname();
  const user = React.useMemo(() => getSessionUser(), []);
  const myId = (user?.username || "").trim();
  const isAdmin = normalizeRole(user?.role) === "ADMIN";
  const [myDept, setMyDept] = React.useState("");
  const [myPositionName, setMyPositionName] = React.useState("");
  const today = React.useMemo(() => new Date(), []);
  const [windowPage, setWindowPage] = React.useState(0);
  const baseWindowStart = React.useMemo(() => addDays(startOfWeek(today), -14), [today]);
  const periodTab = React.useMemo<"MONTHLY" | "WEEKLY" | "DAILY">(() => {
    if ((pathname || "").includes("/board/shifts/weekly")) return "WEEKLY";
    if ((pathname || "").includes("/board/shifts/daily")) return "DAILY";
    return "MONTHLY";
  }, [pathname]);
  const currentWindowStart = React.useMemo(
    () => addDays(baseWindowStart, windowPage * (periodTab === "MONTHLY" ? 35 : periodTab === "WEEKLY" ? 7 : 1)),
    [baseWindowStart, periodTab, windowPage]
  );
  const windowCells = React.useMemo(() => {
    if (periodTab === "MONTHLY") return buildWindowCells(currentWindowStart);
    if (periodTab === "WEEKLY") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(currentWindowStart, i);
        return { date: fmtDate(d), day: d.getDate(), isToday: fmtDate(d) === fmtDate(new Date()) };
      });
    }
    return [{ date: fmtDate(currentWindowStart), day: currentWindowStart.getDate(), isToday: fmtDate(currentWindowStart) === fmtDate(new Date()) }];
  }, [currentWindowStart, periodTab]);
  const rangeLabel = React.useMemo(() => `${windowCells[0]?.date} ~ ${windowCells[windowCells.length - 1]?.date}`, [windowCells]);

  const [entries, setEntries] = React.useState<ShiftEntry[]>([]);
  const [approvedLeaves, setApprovedLeaves] = React.useState<ApprovedLeave[]>([]);
  const [staffOptions, setStaffOptions] = React.useState<StaffOption[]>(FALLBACK_STAFF_OPTIONS);
  const [holidays, setHolidays] = React.useState<Record<string, string>>({});
  const [open, setOpen] = React.useState(false);
  const [viewTab, setViewTab] = React.useState<"ALL" | "DUTY" | "ROTATION">("ALL");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [staffId, setStaffId] = React.useState("");
  const [shiftType, setShiftType] = React.useState<ShiftType>("DAY");
  const [selectedStaffIds, setSelectedStaffIds] = React.useState<string[]>([]);
  const [bulkFromDate, setBulkFromDate] = React.useState("");
  const [bulkToDate, setBulkToDate] = React.useState("");
  const [bulkShiftType, setBulkShiftType] = React.useState<ShiftType>("DAY");
  const [loadingShifts, setLoadingShifts] = React.useState(false);
  const [jumpDate, setJumpDate] = React.useState("");

  const myRank = React.useMemo(() => inferRank(myPositionName), [myPositionName]);
  const isNurseTeamLeader = React.useMemo(() => {
    const roleByAuth = normalizeRole(user?.role);
    const roleByPos = deriveOperationalRole(user?.role, user?.role, myPositionName, myDept);
    const isNurseRole = roleByAuth === "NURSE" || roleByPos === "NURSE";
    return isNurseRole && myPositionName.includes("팀장");
  }, [myDept, myPositionName, user?.role]);
  const isPlanner = isAdmin || isNurseTeamLeader;

  const loadShiftEntries = React.useCallback(async () => {
    setLoadingShifts(true);
    try {
      const [shiftRows, leaveRows] = await Promise.all([
        fetchShiftAssignmentsApi({ fromDate: SHIFT_QUERY_FROM, toDate: SHIFT_QUERY_TO }),
        fetchApprovedLeavesApi(),
      ]);

      const parsed: ShiftEntry[] = shiftRows.map((r) => ({
        id: String(r.id),
        date: r.shiftDate,
        staffId: r.staffId,
        staffName: r.staffName,
        dept: r.departmentName,
        shiftType: r.shiftType,
      }));
      setEntries(parsed);
      const leaves: ApprovedLeave[] = leaveRows.map((r) => ({
        requesterId: r.requesterId,
        requesterName: r.requesterName,
        fromDate: r.fromDate,
        toDate: r.toDate,
        leaveType: r.leaveType,
      }));
      setApprovedLeaves(leaves);
    } catch {
      setEntries([]);
      setApprovedLeaves([]);
    } finally {
      setLoadingShifts(false);
    }
  }, []);

  React.useEffect(() => {
    void loadShiftEntries();
  }, [loadShiftEntries]);

  React.useEffect(() => {
    fetchMyStaffProfileApi()
      .then((me) => {
        setMyDept((me.departmentName || "").trim());
        setMyPositionName((me.positionName || "").trim());
      })
      .catch(() => {
        setMyDept("");
        setMyPositionName("");
      });
  }, []);

  React.useEffect(() => {
    fetchStaffListApi(true)
      .then((rows) => {
        const mapped = rows
          .map((row) => ({
            id: (row.username || "").trim(),
            name: (row.fullName || row.username || "").trim(),
            dept: (row.departmentName || "미지정").trim(),
            role: deriveOperationalRole(row.domainRole, row.domainRole, row.positionName, row.departmentName),
            positionName: (row.positionName || "").trim(),
            rank: inferRank(row.positionName),
          }))
          .filter((row) => !!row.id && (row.role === "DOCTOR" || row.role === "NURSE"))
          .sort((a, b) => {
            if (a.role !== b.role) return a.role === "DOCTOR" ? -1 : 1;
            return a.name.localeCompare(b.name, "ko");
          });
        if (mapped.length) setStaffOptions(mapped);
      })
      .catch(() => {
        setStaffOptions(FALLBACK_STAFF_OPTIONS);
      });
  }, []);

  React.useEffect(() => {
    const years = Array.from(new Set(windowCells.map((c) => Number(c.date.slice(0, 4)))));
    Promise.all(
      years.map(async (year) => {
        try {
          const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/KR`);
          if (!res.ok) return [] as Array<{ date: string; localName?: string; name?: string }>;
          return (await res.json()) as Array<{ date: string; localName?: string; name?: string }>;
        } catch {
          return [] as Array<{ date: string; localName?: string; name?: string }>;
        }
      })
    ).then((lists) => {
      const map: Record<string, string> = {};
      lists.flat().forEach((h) => {
        if (h?.date) map[h.date] = h.localName || h.name || "공휴일";
      });
      setHolidays(map);
    });
  }, [windowCells]);

  React.useEffect(() => {
    const start = windowCells[0]?.date || "";
    const end = windowCells[windowCells.length - 1]?.date || "";
    setBulkFromDate(start);
    setBulkToDate(end);
  }, [windowCells]);

  React.useEffect(() => {
    setWindowPage(0);
  }, [periodTab]);

  React.useEffect(() => {
    if (windowCells[0]?.date) setJumpDate(windowCells[0].date);
  }, [windowCells]);

  const jumpToDate = React.useCallback((dateValue: string) => {
    if (!dateValue) return;
    const target = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(target.getTime())) return;
    const diffDays = Math.floor((target.getTime() - baseWindowStart.getTime()) / 86400000);
    const step = periodTab === "MONTHLY" ? 35 : periodTab === "WEEKLY" ? 7 : 1;
    const nextPage = Math.floor(diffDays / step);
    setWindowPage(nextPage);
  }, [baseWindowStart, periodTab]);

  const openForDate = (date: string) => {
    setSelectedDate(date);
    setStaffId("");
    setShiftType(viewTab === "DUTY" ? "NIGHT" : "DAY");
    setOpen(true);
  };

  const filteredEntries = React.useMemo(
    () => {
      const base = isPlanner ? entries : entries.filter((e) => e.staffId === myId);
      if (viewTab === "ALL") return base;
      if (viewTab === "DUTY") return base.filter((e) => e.shiftType === "NIGHT");
      return base.filter((e) => e.shiftType === "DAY");
    },
    [entries, isPlanner, myId, viewTab]
  );

  const assignableStaffOptions = React.useMemo(() => {
    if (isAdmin) return staffOptions;
    if (!isNurseTeamLeader) return [] as StaffOption[];
    return staffOptions.filter((staff) => staff.dept === myDept && staff.rank > myRank);
  }, [isAdmin, isNurseTeamLeader, myDept, myRank, staffOptions]);

  const availableStaffOptions = React.useMemo(() => {
    if (!selectedDate) return assignableStaffOptions;
    const assignedIds = new Set(
      entries.filter((entry) => entry.date === selectedDate).map((entry) => entry.staffId)
    );
    return assignableStaffOptions.filter((staff) => !assignedIds.has(staff.id));
  }, [assignableStaffOptions, entries, selectedDate]);

  const saveShift = async () => {
    if (!selectedDate || !staffId) return;
    const staff = staffOptions.find((s) => s.id === staffId);
    if (!staff) return;

    const hasApprovedLeave = approvedLeaves.some(
      (leave) => leave.requesterId === staffId && dateBetween(selectedDate, leave.fromDate, leave.toDate)
    );
    if (hasApprovedLeave) {
      window.alert("해당 직원은 승인된 휴가 기간이라 당직/교대 배정을 할 수 없습니다.");
      return;
    }

    const duplicate = entries.some(
      (entry) => entry.date === selectedDate && entry.staffId === staffId && entry.shiftType === shiftType
    );
    if (duplicate) {
      window.alert("같은 날짜/직원/근무타입 배정이 이미 있습니다.");
      return;
    }

    const next: ShiftEntry = {
      id: `${selectedDate}-${staffId}-${shiftType}-${Date.now()}`,
      date: selectedDate,
      staffId,
      staffName: staff.name,
      dept: staff.dept,
      shiftType,
    };
    try {
      await createShiftAssignmentApi({
        shiftDate: next.date,
        staffId: next.staffId,
        staffName: next.staffName,
        departmentName: next.dept,
        shiftType: next.shiftType,
      });
      await loadShiftEntries();
      setOpen(false);
    } catch {
      window.alert("배정 저장에 실패했습니다.");
    }
  };

  const toggleStaffSelection = (id: string) => {
    setSelectedStaffIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const runBulkAssign = async () => {
    if (!selectedStaffIds.length) return window.alert("오른쪽 명단에서 배정 대상을 선택해 주세요.");
    if (!bulkFromDate || !bulkToDate || bulkFromDate > bulkToDate) return window.alert("일괄 배정 기간을 확인해 주세요.");

    const assignedShiftType: ShiftType = viewTab === "DUTY" ? "NIGHT" : bulkShiftType;
    const selectedStaff = assignableStaffOptions.filter((s) => selectedStaffIds.includes(s.id));
    if (!selectedStaff.length) return window.alert("선택된 직원 정보를 찾을 수 없습니다.");

    const targetDates = windowCells
      .map((c) => c.date)
      .filter((date) => date >= bulkFromDate && date <= bulkToDate);

    if (!targetDates.length) return window.alert("현재 달력 범위 내 선택된 날짜가 없습니다.");

    let cursor = 0;
    let created = 0;
    let skipped = 0;

    const added: ShiftEntry[] = [];
    targetDates.forEach((date) => {
      let picked: StaffOption | null = null;
      for (let i = 0; i < selectedStaff.length; i += 1) {
        const candidate = selectedStaff[(cursor + i) % selectedStaff.length];
        const onLeave = approvedLeaves.some((leave) => leave.requesterId === candidate.id && dateBetween(date, leave.fromDate, leave.toDate));
        const duplicated = [...entries, ...added].some((entry) => entry.date === date && entry.staffId === candidate.id && entry.shiftType === assignedShiftType);
        if (!onLeave && !duplicated) {
          picked = candidate;
          cursor = (cursor + i + 1) % selectedStaff.length;
          break;
        }
      }

      if (!picked) {
        skipped += 1;
        return;
      }

      added.push({
        id: `bulk-${date}-${picked.id}-${assignedShiftType}-${Date.now()}-${created}`,
        date,
        staffId: picked.id,
        staffName: picked.name,
        dept: picked.dept,
        shiftType: assignedShiftType,
      });
      created += 1;
    });

    if (!added.length) return window.alert("일괄 배정된 항목이 없습니다. 휴가/중복 여부를 확인해 주세요.");

    try {
      for (const entry of added) {
        await createShiftAssignmentApi({
          shiftDate: entry.date,
          staffId: entry.staffId,
          staffName: entry.staffName,
          departmentName: entry.dept,
          shiftType: entry.shiftType,
        });
      }
      await loadShiftEntries();
      window.alert(`일괄 배정 완료: ${created}건${skipped ? ` (건너뜀 ${skipped}건)` : ""}`);
    } catch {
      window.alert("일괄 배정 저장 중 오류가 발생했습니다.");
    }
  };

  const fairness = React.useMemo(() => {
    const visibleDates = new Set(windowCells.map((c) => c.date));
    return assignableStaffOptions.map((staff) => {
      const target = filteredEntries.filter((e) => e.staffId === staff.id && visibleDates.has(e.date));
      const dayCount = target.filter((e) => e.shiftType === "DAY").length;
      const nightCount = target.filter((e) => e.shiftType === "NIGHT").length;
      return { ...staff, dayCount, nightCount, total: target.length };
    }).sort((a, b) => b.total - a.total);
  }, [assignableStaffOptions, filteredEntries, windowCells]);

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 900 }}>
            {periodTab === "MONTHLY" ? "당직/교대표(월간)" : periodTab === "WEEKLY" ? "당직/교대표(주간)" : "당직/교대표(일일)"}
          </Typography>
          <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
            {periodTab === "MONTHLY"
              ? "5주 단위로 조회합니다. 이전/다음으로 페이지를 넘겨 근무표를 확인하세요."
              : periodTab === "WEEKLY"
              ? "1주 단위로 조회합니다. 이전/다음으로 페이지를 넘겨 근무표를 확인하세요."
              : "1일 단위로 조회합니다. 이전/다음으로 페이지를 넘겨 근무표를 확인하세요."}
          </Typography>
        </Box>

        {!!approvedLeaves.length ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            승인된 휴가 {approvedLeaves.length}건이 반영되어 해당 기간 배정이 자동 차단됩니다.
          </Alert>
        ) : null}

        {loadingShifts ? (
          <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>근무표 데이터를 불러오는 중입니다...</Typography>
        ) : null}

        <Tabs value={viewTab} onChange={(_, v) => setViewTab(v)} sx={{ borderBottom: "1px solid var(--line)" }}>
          <Tab value="ALL" label="당직/교대 전체" />
          <Tab value="DUTY" label="당직" />
          <Tab value="ROTATION" label="교대" />
        </Tabs>

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", xl: "minmax(0,1fr) 320px" } }}>
          <Card sx={{ border: "1px solid var(--line)", borderRadius: 2 }}>
            <CardContent>
              <Typography sx={{ fontWeight: 900, mb: 0.5 }}>근무 달력</Typography>
              <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 1 }}>{rangeLabel}</Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.25 }}>
                <TextField
                  type="date"
                  size="small"
                  label="날짜 이동"
                  InputLabelProps={{ shrink: true }}
                  value={jumpDate}
                  onChange={(e) => setJumpDate(e.target.value)}
                />
                <Button variant="outlined" onClick={() => jumpToDate(jumpDate)}>이동</Button>
              </Stack>

              <Box sx={{ display: "grid", gridTemplateColumns: periodTab === "DAILY" ? "1fr" : "repeat(7, minmax(0, 1fr))", gap: 0.75 }}>
                {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
                  periodTab !== "DAILY" ? <Typography key={w} sx={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>{w}</Typography> : null
                ))}

                {windowCells.map((cell, idx) => {
                  const weekday = idx % 7;
                  const isSunday = weekday === 0;
                  const isSaturday = weekday === 6;
                  const dayEntries = filteredEntries.filter((e) => e.date === cell.date);
                  const leaveNames = approvedLeaves
                    .filter((leave) => dateBetween(cell.date, leave.fromDate, leave.toDate))
                    .map((leave) => leave.requesterName);
                  const holiday = holidays[cell.date];

                  return (
                    <Box
                      key={`window-${idx}`}
                      onClick={() => {
                        if (isPlanner) openForDate(cell.date);
                      }}
                      sx={{
                        minHeight: 104,
                        border: "1px solid var(--line)",
                        borderRadius: 1.5,
                        p: 0.75,
                        bgcolor: cell.isToday
                          ? "#f0f8ff"
                          : isSunday
                          ? "#fff5f5"
                          : isSaturday
                          ? "#f3f7ff"
                          : "#fff",
                        cursor: isPlanner ? "pointer" : "default",
                      }}
                    >
                      <Typography sx={{ fontSize: 12, fontWeight: 800, color: holiday ? "#b91c1c" : "inherit" }}>
                        {cell.day}
                      </Typography>
                      {holiday ? <Typography sx={{ fontSize: 11, color: "#b91c1c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{holiday}</Typography> : null}
                      <Stack spacing={0.4} sx={{ mt: 0.5 }}>
                        {dayEntries.slice(0, 2).map((entry) => (
                          <Chip
                            key={entry.id}
                            size="small"
                            label={`${entry.shiftType === "NIGHT" ? "당직" : "교대"} ${entry.staffName}`}
                            sx={{ bgcolor: entry.shiftType === "DAY" ? "#e5f2ff" : "#eae7ff", fontSize: 11 }}
                          />
                        ))}
                        {periodTab === "DAILY"
                          ? dayEntries.map((entry) => (
                              <Typography key={`${entry.id}-time`} sx={{ fontSize: 12, color: "var(--muted)" }}>
                                {entry.shiftType === "DAY" ? "교대 07:00-15:00" : "당직 21:00-07:00"} · {entry.staffName}
                              </Typography>
                            ))
                          : null}
                        {leaveNames.slice(0, 1).map((name) => (
                          <Chip key={`${cell.date}-leave-${name}`} size="small" label={`휴가 ${name}`} sx={{ bgcolor: "#fff4e5", fontSize: 11 }} />
                        ))}
                        {dayEntries.length + leaveNames.length > 3 ? (
                          <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>+{dayEntries.length + leaveNames.length - 3}건</Typography>
                        ) : null}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
              <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1.25 }}>
                <Button variant="outlined" onClick={() => setWindowPage((p) => p - 1)}>&lt;</Button>
                <Button variant="outlined" onClick={() => setWindowPage((p) => p + 1)}>&gt;</Button>
              </Stack>
            </CardContent>
          </Card>

          {isPlanner ? (
          <Card sx={{ border: "1px solid var(--line)", borderRadius: 2 }}>
            <CardContent>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>배정 균등 지표</Typography>
              <Typography sx={{ fontSize: 12, color: "var(--muted)", mb: 1 }}>
                현재 달력 범위 내 당직 배정 횟수
              </Typography>
              <Stack spacing={1} sx={{ mb: 1.25 }}>
                <TextField type="date" size="small" label="시작일" InputLabelProps={{ shrink: true }} value={bulkFromDate} onChange={(e) => setBulkFromDate(e.target.value)} />
                <TextField type="date" size="small" label="종료일" InputLabelProps={{ shrink: true }} value={bulkToDate} onChange={(e) => setBulkToDate(e.target.value)} />
                {viewTab !== "DUTY" ? (
                  <TextField select size="small" label="근무" value={bulkShiftType} onChange={(e) => setBulkShiftType(e.target.value as ShiftType)}>
                    <MenuItem value="DAY">교대(주간)</MenuItem>
                    <MenuItem value="NIGHT">교대(야간)</MenuItem>
                  </TextField>
                ) : null}
                <Button variant="contained" onClick={runBulkAssign}>선택 인원 일괄 배정</Button>
              </Stack>
              <Stack spacing={0.75}>
                {fairness.map((s) => (
                  <Box
                    key={`fair-${s.id}`}
                    onClick={() => toggleStaffSelection(s.id)}
                    sx={{
                      border: selectedStaffIds.includes(s.id) ? "1px solid #0b5b8f" : "1px solid var(--line)",
                      borderRadius: 1.5,
                      p: 1,
                      cursor: "pointer",
                      bgcolor: selectedStaffIds.includes(s.id) ? "rgba(11,91,143,0.08)" : "transparent",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{s.name}</Typography>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>
                      총 {s.total}회 · 주간 {s.dayCount}회 · 야간 {s.nightCount}회
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
          ) : (
            <Card sx={{ border: "1px solid var(--line)", borderRadius: 2 }}>
              <CardContent>
                <Typography sx={{ fontWeight: 900, mb: 0.5 }}>내 근무표</Typography>
                <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                  배정 화면은 관리자만 사용합니다. 현재 화면에는 본인 배정만 표시됩니다.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        <Dialog open={isPlanner && open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>당직/교대 배정</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1.25} sx={{ mt: 0.5 }}>
              <TextField label="일자" value={selectedDate} InputProps={{ readOnly: true }} fullWidth />
              <TextField select label="직원" value={staffId} onChange={(e) => setStaffId(e.target.value)} fullWidth>
                <MenuItem value="">선택</MenuItem>
                {availableStaffOptions.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>{staff.name} ({staff.dept})</MenuItem>
                ))}
              </TextField>
              {!availableStaffOptions.length ? (
                <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>
                  해당 날짜에는 배정 가능한 직원이 없습니다.
                </Typography>
              ) : null}
              {viewTab === "DUTY" ? (
                <TextField label="근무" value="당직(야간)" InputProps={{ readOnly: true }} fullWidth />
              ) : (
                <TextField select label="근무" value={shiftType} onChange={(e) => setShiftType(e.target.value as ShiftType)} fullWidth>
                  <MenuItem value="DAY">주간</MenuItem>
                  <MenuItem value="NIGHT">야간</MenuItem>
                </TextField>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>취소</Button>
            <Button variant="contained" onClick={saveShift}>저장</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </MainLayout>
  );
}
