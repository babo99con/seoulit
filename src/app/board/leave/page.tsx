"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { getSessionUser } from "@/lib/session";
import { fetchStaffListApi } from "@/lib/staffApi";
import {
  createLeaveRequestApi,
  decideLeaveRequestApi,
  fetchLeaveRequestsApi,
} from "@/lib/leaveApi";
import {
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

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
type LineType = "APPROVAL" | "CC";

type ApprovalLine = {
  id: number;
  lineType: LineType;
  approverId: string;
  approverName: string;
  lineOrder: number;
  status: ApprovalStatus;
  actedAt?: string;
};

type LeaveReq = {
  id: number;
  requesterId: string;
  requesterName: string;
  department: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  createdAt: string;
  lines: ApprovalLine[];
};

type StaffOption = { id: string; name: string; dept: string };

const nowText = () => new Date().toISOString().slice(0, 16).replace("T", " ");

const statusLabel = (status: ApprovalStatus) => {
  if (status === "APPROVED") return "승인";
  if (status === "REJECTED") return "반려";
  return "대기";
};

const finalStatus = (item: LeaveReq) => {
  const lines = item.lines.filter((line) => line.lineType === "APPROVAL");
  if (lines.some((line) => line.status === "REJECTED")) return "반려";
  if (lines.length && lines.every((line) => line.status === "APPROVED")) return "최종승인";
  return "진행중";
};

const canActLine = (item: LeaveReq, line: ApprovalLine) => {
  if (line.lineType !== "APPROVAL" || line.status !== "PENDING") return false;
  if (finalStatus(item) !== "진행중") return false;
  const prev = item.lines.filter((l) => l.lineType === "APPROVAL" && l.lineOrder < line.lineOrder);
  return prev.every((l) => l.status === "APPROVED");
};

export default function BoardLeavePage() {
  const user = React.useMemo(() => getSessionUser(), []);
  const myId = (user?.username || "").trim();
  const myName = (user?.fullName || user?.username || "사용자").trim();

  const [staffOptions, setStaffOptions] = React.useState<StaffOption[]>([]);
  const [items, setItems] = React.useState<LeaveReq[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"pending" | "mine" | "approval">("pending");
  const [detail, setDetail] = React.useState<LeaveReq | null>(null);
  const [nextApprover, setNextApprover] = React.useState("");
  const [nextCc, setNextCc] = React.useState("");
  const [form, setForm] = React.useState({
    leaveType: "연차",
    fromDate: "",
    toDate: "",
    reason: "",
    approverIds: [] as string[],
    ccIds: [] as string[],
  });

  const myDept = React.useMemo(() => staffOptions.find((s) => s.id === myId)?.dept || "미지정", [myId, staffOptions]);

  const loadLeaves = React.useCallback(async (nextTab: "pending" | "mine" | "approval" = tab) => {
    setLoading(true);
    try {
      const res = await fetchLeaveRequestsApi(nextTab);
      setItems(res as unknown as LeaveReq[]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  React.useEffect(() => {
    fetchStaffListApi(true)
      .then((rows) => {
        setStaffOptions(
          rows
            .map((row) => ({
              id: (row.username || "").trim(),
              name: (row.fullName || row.username || "").trim(),
              dept: (row.departmentName || "미지정").trim(),
            }))
            .filter((r) => !!r.id)
        );
      })
      .catch(() => setStaffOptions([]));
    void loadLeaves(tab);
  }, [loadLeaves, tab]);

  const visibleItems = React.useMemo(() => {
    const canView = (it: LeaveReq) => it.requesterId === myId || it.lines.some((line) => line.approverId === myId);
    const base = items.filter(canView);
    if (tab === "mine") return base.filter((it) => it.requesterId === myId);
    if (tab === "approval") return base.filter((it) => it.lines.some((line) => line.approverId === myId));
    return base.filter((it) => it.lines.some((line) => line.approverId === myId && canActLine(it, line)));
  }, [items, myId, tab]);

  const openCreate = () => {
    setForm({ leaveType: "연차", fromDate: "", toDate: "", reason: "", approverIds: [], ccIds: [] });
    setNextApprover("");
    setNextCc("");
    setOpen(true);
  };

  const submit = async () => {
    if (!form.fromDate || !form.toDate || !form.reason.trim()) return;
    if (!form.approverIds.length) return window.alert("결재선을 1명 이상 지정해 주세요.");

    const approverLines = form.approverIds.map((id, idx) => {
      const staff = staffOptions.find((s) => s.id === id);
      return {
        id: Date.now() + idx + 1,
        lineType: "APPROVAL" as const,
        approverId: id,
        approverName: staff?.name || id,
        lineOrder: idx + 1,
        status: "PENDING" as const,
      };
    });
    const ccLines = form.ccIds.filter((id) => !form.approverIds.includes(id)).map((id, idx) => {
      const staff = staffOptions.find((s) => s.id === id);
      return {
        id: Date.now() + 1000 + idx + 1,
        lineType: "CC" as const,
        approverId: id,
        approverName: staff?.name || id,
        lineOrder: idx + 1,
        status: "PENDING" as const,
      };
    });

    const leave: LeaveReq = {
      id: Date.now(),
      requesterId: myId,
      requesterName: myName,
      department: myDept,
      leaveType: form.leaveType,
      fromDate: form.fromDate,
      toDate: form.toDate,
      reason: form.reason.trim(),
      createdAt: nowText(),
      lines: [...approverLines, ...ccLines],
    };

    try {
      await createLeaveRequestApi({
        leaveType: leave.leaveType,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        reason: leave.reason,
        approverIds: form.approverIds,
        ccIds: form.ccIds,
      });
      setOpen(false);
      await loadLeaves(tab);
    } catch {
      window.alert("휴가 신청 저장에 실패했습니다.");
    }
  };

  const applyDecision = async (item: LeaveReq, lineId: number, decision: "APPROVED" | "REJECTED") => {
    const updated: LeaveReq = {
      ...item,
      lines: item.lines.map((line) => (line.id === lineId ? { ...line, status: decision, actedAt: nowText() } : line)),
    };

    try {
      await decideLeaveRequestApi(item.id, { lineId, action: decision });
      await loadLeaves(tab);
      if (detail?.id === item.id) setDetail(updated);
    } catch {
      window.alert("결재 처리에 실패했습니다.");
    }
  };

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 900 }}>휴가/근태</Typography>
            <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>DB 저장 기반 결재 흐름입니다. 기안자/결재자/참조자만 문서를 확인합니다.</Typography>
          </Box>
          <Button variant="contained" onClick={openCreate}>휴가 신청</Button>
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid var(--line)" }}>
          <Tab value="pending" label="결재 대기함" />
          <Tab value="mine" label="내가 올린 문서" />
          <Tab value="approval" label="내 결재/참조 문서" />
        </Tabs>

        {loading ? <Typography sx={{ color: "var(--muted)" }}>문서를 불러오는 중...</Typography> : null}

        {visibleItems.map((it) => {
          const mine = it.requesterId === myId;
          const myLines = it.lines.filter((line) => line.approverId === myId);
          const pendingLine = myLines.find((line) => canActLine(it, line));

          return (
            <Card key={it.id} sx={{ border: "1px solid var(--line)", cursor: "pointer" }} onClick={() => setDetail(it)}>
              <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>{it.requesterName} · {it.leaveType} · {it.fromDate} ~ {it.toDate}</Typography>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>{it.department} · 사유: {it.reason}</Typography>
                    <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>상태: {finalStatus(it)} · 생성 {it.createdAt}</Typography>
                  </Box>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                    {mine ? <Chip size="small" label="기안자" color="primary" variant="outlined" /> : null}
                    {myLines.map((line) => (
                      <Chip key={line.id} size="small" color={line.lineType === "APPROVAL" ? "primary" : "default"} label={line.lineType === "APPROVAL" ? `결재 ${statusLabel(line.status)}` : "참조"} />
                    ))}
                  </Stack>
                </Stack>

                {pendingLine ? (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); void applyDecision(it, pendingLine.id, "APPROVED"); }}>승인</Button>
                    <Button size="small" color="error" variant="outlined" onClick={(e) => { e.stopPropagation(); void applyDecision(it, pendingLine.id, "REJECTED"); }}>반려</Button>
                  </Stack>
                ) : null}
              </CardContent>
            </Card>
          );
        })}

        {!loading && !visibleItems.length ? (
          <Typography sx={{ color: "var(--muted)", textAlign: "center", py: 3 }}>
            {tab === "pending" ? "결재 대기 문서가 없습니다." : "결재/참조에 포함된 문서가 없습니다."}
          </Typography>
        ) : null}

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>휴가 신청</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1.25} sx={{ mt: 0.5 }}>
              <TextField select label="휴가 유형" value={form.leaveType} onChange={(e) => setForm((p) => ({ ...p, leaveType: e.target.value }))}>
                <MenuItem value="연차">연차</MenuItem>
                <MenuItem value="반차">반차</MenuItem>
                <MenuItem value="병가">병가</MenuItem>
              </TextField>
              <TextField type="date" label="시작일" InputLabelProps={{ shrink: true }} value={form.fromDate} onChange={(e) => setForm((p) => ({ ...p, fromDate: e.target.value }))} />
              <TextField type="date" label="종료일" InputLabelProps={{ shrink: true }} value={form.toDate} onChange={(e) => setForm((p) => ({ ...p, toDate: e.target.value }))} />
              <TextField label="사유" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} multiline minRows={3} />

              <TextField select label="결재선 추가" value={nextApprover} onChange={(e) => setNextApprover(e.target.value)}>
                <MenuItem value="">선택</MenuItem>
                {staffOptions.filter((s) => s.id !== myId).map((s) => (
                  <MenuItem key={`app-${s.id}`} value={s.id}>{s.name} ({s.id})</MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                disabled={!nextApprover}
                onClick={() => {
                  if (!nextApprover) return;
                  setForm((p) => ({ ...p, approverIds: p.approverIds.includes(nextApprover) ? p.approverIds : [...p.approverIds, nextApprover] }));
                  setNextApprover("");
                }}
              >결재선 추가</Button>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>결재선: {form.approverIds.join(" -> ") || "(없음)"}</Typography>

              <TextField select label="참조자 추가" value={nextCc} onChange={(e) => setNextCc(e.target.value)}>
                <MenuItem value="">선택</MenuItem>
                {staffOptions.filter((s) => s.id !== myId).map((s) => (
                  <MenuItem key={`cc-${s.id}`} value={s.id}>{s.name} ({s.id})</MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                disabled={!nextCc}
                onClick={() => {
                  if (!nextCc) return;
                  setForm((p) => ({ ...p, ccIds: p.ccIds.includes(nextCc) ? p.ccIds : [...p.ccIds, nextCc] }));
                  setNextCc("");
                }}
              >참조 추가</Button>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>참조: {form.ccIds.join(", ") || "(없음)"}</Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>취소</Button>
            <Button variant="contained" onClick={() => void submit()}>신청</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm">
          <DialogTitle>결재 상세</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              <Typography sx={{ fontWeight: 800 }}>{detail?.requesterName} · {detail?.leaveType}</Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>{detail?.fromDate} ~ {detail?.toDate} · 상태 {detail ? finalStatus(detail) : "-"}</Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{detail?.reason || "(사유 없음)"}</Typography>
              <Typography sx={{ fontWeight: 700, mt: 1 }}>결재/참조 진행 현황</Typography>
              {(detail?.lines || []).map((line) => (
                <Typography key={line.id} sx={{ fontSize: 13 }}>
                  {line.lineType === "APPROVAL" ? `결재 ${line.lineOrder}차` : `참조 ${line.lineOrder}`} · {line.approverName}({line.approverId}) · {statusLabel(line.status)} {line.actedAt ? `(${line.actedAt})` : ""}
                </Typography>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetail(null)}>닫기</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </MainLayout>
  );
}
