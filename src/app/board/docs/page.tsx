"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Pagination, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { getSessionUser } from "@/lib/session";
import { createCommonDocApi, deleteCommonDocApi, fetchCommonDocApi, fetchCommonDocPageApi, type CommonDoc, updateCommonDocApi } from "@/lib/commonDocsApi";
import { fetchDepartmentsApi, fetchStaffListApi } from "@/lib/staffApi";

const PAGE_SIZE = 10;
const CATEGORIES = ["규정", "매뉴얼", "양식", "교육자료", "공문"];

export default function BoardDocsPage() {
  const user = React.useMemo(() => getSessionUser(), []);
  const [items, setItems] = React.useState<CommonDoc[]>([]);
  const [keyword, setKeyword] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [box, setBox] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [departments, setDepartments] = React.useState<Array<{ id: number; name: string }>>([]);
  const [staffs, setStaffs] = React.useState<Array<{ username: string; fullName: string }>>([]);

  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<CommonDoc | null>(null);
  const [nextApprover, setNextApprover] = React.useState("");
  const [nextCc, setNextCc] = React.useState("");
  const [dragApprover, setDragApprover] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    category: CATEGORIES[0],
    title: "",
    receiverDeptId: "",
    receiverDeptName: "",
    approverIds: [] as string[],
    ccIds: [] as string[],
    attachmentFileName: "",
    attachmentMimeType: "",
    attachmentBase64: "",
    content: "",
  });

  const loadPage = React.useCallback(async (nextPage: number, nextKeyword: string, nextBox: string) => {
    try {
      const result = await fetchCommonDocPageApi(nextPage - 1, PAGE_SIZE, nextKeyword, nextBox);
      setItems(result.items || []);
      setPage(result.page + 1);
      setPageCount(Math.max(1, result.totalPages || 1));
      setErrorMessage(null);
    } catch (error) {
      setItems([]);
      setPageCount(1);
      setErrorMessage(error instanceof Error ? error.message : "문서함을 불러오지 못했습니다.");
    }
  }, []);

  React.useEffect(() => {
    void loadPage(1, "", box);
  }, [loadPage, box]);

  React.useEffect(() => {
    fetchDepartmentsApi(true).then((rows) => setDepartments(rows.map((d) => ({ id: d.id, name: d.name })))).catch(() => setDepartments([]));
    fetchStaffListApi(true)
      .then((rows) => setStaffs((rows || []).map((s) => ({ username: s.username || "", fullName: s.fullName || s.username || "" })).filter((s) => s.username)))
      .catch(() => setStaffs([]));
  }, []);

  const displayNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const s of staffs) map.set(s.username, s.fullName || s.username);
    return map;
  }, [staffs]);

  const isOwner = React.useCallback((item: CommonDoc) => (item.authorId || "") === (user?.username || ""), [user?.username]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ category: CATEGORIES[0], title: "", receiverDeptId: "", receiverDeptName: "", approverIds: [], ccIds: [], attachmentFileName: "", attachmentMimeType: "", attachmentBase64: "", content: "" });
    setNextApprover("");
    setNextCc("");
    setOpen(true);
  };

  const openEdit = (item: CommonDoc) => {
    if (!isOwner(item)) return;
    setEditingId(item.id);
    setForm({
      category: item.category || CATEGORIES[0],
      title: item.title || "",
      receiverDeptId: item.receiverDeptId ? String(item.receiverDeptId) : "",
      receiverDeptName: item.receiverDeptName || "",
      approverIds: (item.lines || []).filter((l) => l.lineType === "APPROVAL").map((l) => l.approverId),
      ccIds: (item.lines || []).filter((l) => l.lineType === "CC").map((l) => l.approverId),
      attachmentFileName: item.attachmentFileName || "",
      attachmentMimeType: item.attachmentMimeType || "",
      attachmentBase64: "",
      content: item.content || "",
    });
    setNextApprover("");
    setNextCc("");
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim()) return;
    if (!form.receiverDeptId) return window.alert("수신 부서를 선택해 주세요.");
    if (!form.approverIds.length) return window.alert("결재선을 1명 이상 지정해 주세요.");
    const req = {
      category: form.category,
      title: form.title.trim(),
      content: form.content.trim(),
      receiverDeptId: Number(form.receiverDeptId),
      receiverDeptName: form.receiverDeptName,
      approverIds: form.approverIds,
      ccIds: form.ccIds,
      attachmentFileName: form.attachmentFileName || undefined,
      attachmentMimeType: form.attachmentMimeType || undefined,
      attachmentBase64: form.attachmentBase64 || undefined,
      authorId: user?.username || "",
      authorName: user?.fullName || user?.username || "작성자",
    };
    try {
      if (editingId) await updateCommonDocApi(editingId, req);
      else await createCommonDocApi(req);
      setOpen(false);
      setDetail(null);
      await loadPage(editingId ? page : 1, keyword, box);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "문서 저장 실패");
    }
  };

  const remove = async () => {
    if (!detail || !isOwner(detail)) return;
    if (!window.confirm("문서를 삭제하시겠습니까?")) return;
    await deleteCommonDocApi(detail.id);
    setDetail(null);
    await loadPage(page, keyword, box);
  };

  const openDetail = async (item: CommonDoc) => {
    try {
      setDetail(await fetchCommonDocApi(item.id));
    } catch {
      setDetail(item);
    }
  };

  const actLine = async (lineId: number, action: "APPROVE" | "REJECT" | "READ") => {
    if (!detail) return;
    const reason = action === "REJECT" ? window.prompt("반려 사유", "사유 없음") || "사유 없음" : undefined;
    await updateCommonDocApi(detail.id, {
      category: detail.category,
      title: detail.title,
      content: detail.content || "",
      receiverDeptId: detail.receiverDeptId || null,
      receiverDeptName: detail.receiverDeptName || undefined,
      lineId,
      approvalAction: action,
      rejectionReason: reason,
      authorId: user?.username || "",
      authorName: user?.fullName || user?.username || "작성자",
    });
    setDetail(await fetchCommonDocApi(detail.id));
    await loadPage(page, keyword, box);
  };

  const reorderApprover = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setForm((p) => {
      const next = [...p.approverIds];
      const from = next.indexOf(fromId);
      const to = next.indexOf(toId);
      if (from < 0 || to < 0) return p;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...p, approverIds: next };
    });
  };

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 900 }}>문서함</Typography>
            <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>내문서/부서문서/결재문서/수신함/반송함을 관리합니다.</Typography>
          </Box>
          <Button variant="contained" onClick={openCreate}>문서 등록</Button>
        </Stack>

        <Tabs value={box} onChange={(_, v) => setBox(v)} sx={{ bgcolor: "rgba(255,255,255,0.65)", borderRadius: 2, px: 1, border: "1px solid var(--line)" }}>
          <Tab value="ALL" label="전체" />
          <Tab value="MINE" label="내가 작성한 문서" />
          <Tab value="DEPT_RECEIVED" label="우리부서 문서" />
          <Tab value="TO_APPROVE" label="처리해야할 문서" />
          <Tab value="REJECTED" label="반려된 문서" />
          <Tab value="INBOX" label="수신함" />
          <Tab value="RETURNED" label="반송함" />
        </Tabs>

        <Stack direction="row" spacing={1}>
          <TextField fullWidth size="small" placeholder="문서명/카테고리 검색" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Button variant="outlined" onClick={async () => {
            setKeyword(searchInput.trim());
            await loadPage(1, searchInput.trim(), box);
          }}>검색</Button>
        </Stack>

        {items.map((doc) => (
          <Card key={doc.id} onClick={() => void openDetail(doc)} sx={{ border: "1px solid var(--line)", cursor: "pointer" }}>
            <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
              <Typography sx={{ fontWeight: 800 }}>{doc.title}</Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                {doc.category} · 발신 {doc.senderDeptName || "-"} · 수신 {doc.receiverDeptName || "-"} · 결재 {doc.approvalStatus || "PENDING"}
              </Typography>
            </CardContent>
          </Card>
        ))}

        {!items.length ? <Typography sx={{ color: "var(--muted)", textAlign: "center", py: 3 }}>{errorMessage || "문서가 없습니다."}</Typography> : null}

        <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
          <Pagination count={pageCount} page={page} onChange={(_, value) => void loadPage(value, keyword, box)} color="primary" />
        </Stack>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{editingId ? "문서 수정" : "문서 등록"}</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1.25} sx={{ mt: 0.5 }}>
              <TextField select SelectProps={{ native: true }} label="카테고리" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} fullWidth>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </TextField>
              <TextField label="제목" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} fullWidth />
              <TextField select SelectProps={{ native: true }} label="수신 부서(활성만)" value={form.receiverDeptId} onChange={(e) => {
                const id = e.target.value;
                const dept = departments.find((d) => String(d.id) === id);
                setForm((p) => ({ ...p, receiverDeptId: id, receiverDeptName: dept?.name || "" }));
              }} fullWidth>
                <option value="">선택</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </TextField>

              <Stack direction="row" spacing={1}>
                <TextField select SelectProps={{ native: true }} label="결재선 추가" value={nextApprover} onChange={(e) => setNextApprover(e.target.value)} fullWidth>
                  <option value="">선택</option>
                  {staffs.map((s) => <option key={s.username} value={s.username}>{s.fullName} ({s.username})</option>)}
                </TextField>
                <Button variant="outlined" onClick={() => {
                  if (!nextApprover) return;
                  setForm((p) => ({ ...p, approverIds: p.approverIds.includes(nextApprover) ? p.approverIds : [...p.approverIds, nextApprover] }));
                  setNextApprover("");
                }}>추가</Button>
              </Stack>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>결재선: {form.approverIds.join(" -> ") || "(없음)"}</Typography>
              {!!form.approverIds.length ? (
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                  {form.approverIds.map((id) => (
                    <Chip
                      key={`approver-${id}`}
                      label={displayNameById.get(id) || id}
                      size="small"
                      draggable
                      onDragStart={() => setDragApprover(id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragApprover) reorderApprover(dragApprover, id);
                        setDragApprover(null);
                      }}
                      onDragEnd={() => setDragApprover(null)}
                      onDelete={() => {
                        if (window.confirm(`${id} 결재선을 제거할까요?`)) {
                          setForm((p) => ({ ...p, approverIds: p.approverIds.filter((v) => v !== id) }));
                        }
                      }}
                      deleteIcon={<span style={{ fontWeight: 700, fontSize: 12 }}>x</span>}
                      sx={{ cursor: "grab", "&:active": { cursor: "grabbing" } }}
                      title={`${id} (드래그로 순서 변경 / X로 제거)`}
                    />
                  ))}
                </Stack>
              ) : null}
              {!!form.approverIds.length ? <Typography sx={{ fontSize: 11, color: "var(--muted)" }}>결재선 칩을 드래그하면 순서가 바뀝니다.</Typography> : null}

              <Stack direction="row" spacing={1}>
                <TextField select SelectProps={{ native: true }} label="참조자 추가" value={nextCc} onChange={(e) => setNextCc(e.target.value)} fullWidth>
                  <option value="">선택</option>
                  {staffs.map((s) => <option key={s.username} value={s.username}>{s.fullName} ({s.username})</option>)}
                </TextField>
                <Button variant="outlined" onClick={() => {
                  if (!nextCc) return;
                  setForm((p) => ({ ...p, ccIds: p.ccIds.includes(nextCc) ? p.ccIds : [...p.ccIds, nextCc] }));
                  setNextCc("");
                }}>추가</Button>
              </Stack>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>참조: {form.ccIds.join(", ") || "(없음)"}</Typography>
              {!!form.ccIds.length ? (
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                  {form.ccIds.map((id) => (
                    <Chip
                      key={`cc-${id}`}
                      label={displayNameById.get(id) || id}
                      size="small"
                      onDelete={() => {
                        if (window.confirm(`${id} 참조를 제거할까요?`)) {
                          setForm((p) => ({ ...p, ccIds: p.ccIds.filter((v) => v !== id) }));
                        }
                      }}
                      deleteIcon={<span style={{ fontWeight: 700, fontSize: 12 }}>x</span>}
                      title={id}
                    />
                  ))}
                </Stack>
              ) : null}

              <Button component="label" variant="outlined">
                첨부파일 선택
                <input
                  hidden
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const raw = String(reader.result || "");
                      const base64 = raw.includes(",") ? raw.split(",")[1] : raw;
                      setForm((p) => ({ ...p, attachmentFileName: file.name, attachmentMimeType: file.type || "application/octet-stream", attachmentBase64: base64 }));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </Button>
              <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>{form.attachmentFileName || "첨부 없음"}</Typography>

              <TextField label="내용" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} multiline minRows={6} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>닫기</Button>
            <Button variant="contained" onClick={() => void submit()}>저장</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm">
          <DialogTitle>문서 상세</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              <Typography sx={{ fontWeight: 800 }}>{detail?.title}</Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 12 }}>카테고리 {detail?.category} · 발신 {detail?.senderDeptName || "-"} · 수신 {detail?.receiverDeptName || "-"} · 결재 {detail?.approvalStatus || "PENDING"}</Typography>
              {detail?.attachmentFileName ? <Typography sx={{ fontSize: 12 }}>첨부: {detail.attachmentFileName}</Typography> : null}
              {detail?.rejectionReason ? <Typography sx={{ fontSize: 12, color: "#b91c1c" }}>반려사유: {detail.rejectionReason}</Typography> : null}
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{detail?.content || "(내용 없음)"}</Typography>
              <Typography sx={{ fontWeight: 700, mt: 1 }}>결재 히스토리</Typography>
              {(detail?.lines || []).map((line) => (
                <Typography key={line.id} sx={{ fontSize: 12, color: "var(--muted)" }}>
                  {line.lineOrder}. [{line.lineType}] {line.approverName}({line.approverId}) - {line.actionStatus} {line.actedAt ? `(${line.actedAt})` : ""}
                </Typography>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetail(null)}>닫기</Button>
            {(detail?.lines || []).filter((l) => l.approverId === (user?.username || "") && l.actionStatus === "PENDING").map((line) => (
              <React.Fragment key={line.id}>
                <Button onClick={() => void actLine(line.id, line.lineType === "CC" ? "READ" : "APPROVE")}>{line.lineType === "CC" ? "확인" : "승인"}</Button>
                {line.lineType === "APPROVAL" ? <Button color="error" onClick={() => void actLine(line.id, "REJECT")}>반려</Button> : null}
              </React.Fragment>
            ))}
            {detail && isOwner(detail) ? (
              <>
                <Button onClick={() => openEdit(detail)}>수정</Button>
                <Button color="error" onClick={() => void remove()}>삭제</Button>
              </>
            ) : null}
          </DialogActions>
        </Dialog>
      </Stack>
    </MainLayout>
  );
}
