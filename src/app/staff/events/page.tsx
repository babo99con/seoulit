"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Pagination,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { getSessionUser } from "@/lib/session";
import { fetchMyStaffProfileApi } from "@/lib/staffApi";
import {
  createStaffBoardPostApi,
  deleteStaffBoardPostApi,
  fetchStaffBoardPostApi,
  fetchStaffBoardPageApi,
  type StaffBoardPost,
  updateStaffBoardPostApi,
} from "@/lib/staffBoardApi";

const PAGE_SIZE = 10;
const EVENT_TYPES = ["경사", "조사"] as const;

const parseEventType = (item: StaffBoardPost) => {
  if (!item.content) return "";
  if (item.content.startsWith("TYPE:")) {
    const firstLine = item.content.split("\n")[0] || "";
    return firstLine.slice(5).trim();
  }
  return item.content;
};

const parseEventDetail = (item: StaffBoardPost) => {
  if (!item.content) return "";
  if (!item.content.startsWith("TYPE:")) return item.content;
  const lines = item.content.split("\n");
  return lines.slice(1).join("\n").trim();
};

const parseEventTitleBody = (item: StaffBoardPost) => {
  const raw = (item.title || "").trim();
  return raw.replace(/^\[[^\]]+\]\s*/, "");
};

const toTypeLabel = (type: string) => (type === "조사" ? "부고" : "경사");

export default function StaffEventsPage() {
  const currentUser = React.useMemo(() => getSessionUser(), []);
  const [items, setItems] = React.useState<StaffBoardPost[]>([]);
  const [keyword, setKeyword] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageCount, setPageCount] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<StaffBoardPost | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletePinInput, setDeletePinInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [myDeptName, setMyDeptName] = React.useState("");
  const [hideNotices, setHideNotices] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    type: "경사",
    date: new Date().toISOString().slice(0, 10),
    isNotice: false,
    detail: "",
    deletePin: "",
  });

  const visibleItems = React.useMemo(() => {
    if (hideNotices) return items;
    const notices = items.filter((item) => item.postType === "공지");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateDiff = (value?: string | null) => {
      if (!value) return Number.MAX_SAFE_INTEGER;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return Number.MAX_SAFE_INTEGER;
      d.setHours(0, 0, 0, 0);
      return Math.floor((d.getTime() - today.getTime()) / 86400000);
    };

    const rankedNotices = [...notices].sort((a, b) => {
      const da = dateDiff(a.eventDate);
      const db = dateDiff(b.eventDate);
      const aFuture = da >= 0;
      const bFuture = db >= 0;
      if (aFuture !== bFuture) return aFuture ? -1 : 1;
      if (aFuture && bFuture) return da - db;
      return db - da;
    });

    const visibleNoticeIds = new Set(rankedNotices.slice(0, 5).map((item) => item.id));
    return items.filter((item) => item.postType !== "공지" || visibleNoticeIds.has(item.id));
  }, [hideNotices, items]);

  const loadPage = React.useCallback(async (nextPage: number, nextKeyword: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (hideNotices) {
        const result = await fetchStaffBoardPageApi({
          category: "EVENT",
          keyword: nextKeyword,
          page: 0,
          size: 500,
        });
        const normalItems = (result.items || []).filter((item) => item.postType !== "공지");
        const start = (nextPage - 1) * PAGE_SIZE;
        setItems(normalItems.slice(start, start + PAGE_SIZE));
        setPage(nextPage);
        setPageCount(Math.max(1, Math.ceil(normalItems.length / PAGE_SIZE)));
      } else {
        const result = await fetchStaffBoardPageApi({
          category: "EVENT",
          keyword: nextKeyword,
          page: nextPage - 1,
          size: PAGE_SIZE,
        });
        setItems(result.items || []);
        setPage(result.page + 1);
        setPageCount(Math.max(1, result.totalPages || 1));
      }
    } catch (error) {
      setItems([]);
      setPageCount(1);
      setErrorMessage(error instanceof Error ? error.message : "경조사를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [hideNotices]);

  React.useEffect(() => {
    void loadPage(1, keyword);
  }, [hideNotices, keyword, loadPage]);

  React.useEffect(() => {
    fetchMyStaffProfileApi()
      .then((profile) => setMyDeptName(profile.departmentName || ""))
      .catch(() => setMyDeptName(""));
  }, []);

  const isOwner = React.useCallback(
    (item: StaffBoardPost) => {
      const username = (currentUser?.username || "").trim();
      const fullName = (currentUser?.fullName || "").trim();
      return item.authorId === username || (!!fullName && item.authorName === fullName);
    },
    [currentUser?.fullName, currentUser?.username]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      type: "경사",
      date: new Date().toISOString().slice(0, 10),
      isNotice: false,
      detail: "",
      deletePin: "",
    });
    setOpen(true);
  };

  const openEdit = (item: StaffBoardPost) => {
    if (!isOwner(item)) return;
    setEditingId(item.id);
    setForm({
      title: parseEventTitleBody(item),
      type: parseEventType(item) || "경사",
      date: item.eventDate || new Date().toISOString().slice(0, 10),
      isNotice: item.postType === "공지",
      detail: parseEventDetail(item),
      deletePin: "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.type.trim()) return;
    if (!form.date) {
      window.alert("경조사 일자를 선택해 주세요.");
      return;
    }
    if (!editingId && !/^\d{4}$/.test(form.deletePin)) {
      window.alert("삭제 비밀번호는 4자리 숫자로 입력해 주세요.");
      return;
    }

    try {
      const req = {
        postType: form.isNotice ? "공지" : "일반",
        title: `[${toTypeLabel(form.type.trim())}] ${form.title.trim()}`,
        content: `TYPE:${form.type.trim()}\n\n${form.detail.trim()}`,
        eventDate: form.date,
        subjectName: form.title.trim(),
        departmentName: myDeptName,
        authorId: currentUser?.username || "",
        authorName: currentUser?.fullName || currentUser?.username || "작성자",
        deletePin: editingId ? undefined : form.deletePin,
      };
      if (editingId) {
        await updateStaffBoardPostApi("EVENT", editingId, req);
      } else {
        await createStaffBoardPostApi("EVENT", req);
      }
      setOpen(false);
      setDetail(null);
      await loadPage(editingId ? page : 1, keyword);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
    }
  };

  const remove = async () => {
    if (!detail || !isOwner(detail)) return;
    try {
      await deleteStaffBoardPostApi("EVENT", detail.id, deletePinInput);
      setDeleteOpen(false);
      setDetail(null);
      setDeletePinInput("");
      await loadPage(page, keyword);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  };


  return (
    <MainLayout>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 900 }}>경조사</Typography>
            <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>직원 경조사 및 부서별 소식을 확인합니다.</Typography>
          </Box>
          <Button variant="contained" onClick={openCreate}>등록</Button>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="제목/내용/부서 검색"
            fullWidth
          />
          <FormControlLabel
            control={<Checkbox checked={hideNotices} onChange={(e) => setHideNotices(e.target.checked)} />}
            label="공지 숨기기"
            sx={{ ml: 0.5, whiteSpace: "nowrap" }}
          />
          <Button
            variant="outlined"
            onClick={async () => {
              setKeyword(searchInput.trim());
              await loadPage(1, searchInput.trim());
            }}
          >
            검색
          </Button>
        </Stack>

        {visibleItems.map((item) => (
          <Card key={item.id} onClick={async () => {
            try {
              const found = await fetchStaffBoardPostApi("EVENT", item.id);
              setDetail(found);
            } catch {
              setDetail(item);
            }
          }} sx={{ borderRadius: 2, border: item.postType === "공지" ? "1px solid #1e3a5f" : "1px solid var(--line)", cursor: "pointer", backgroundColor: item.postType === "공지" ? "#244a75" : "#fff" }}>
            <CardContent sx={{ py: 1.25, px: 1.75, "&:last-child": { pb: 1.25 } }}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.25}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, color: item.postType === "공지" ? "#f8fbff" : "inherit" }}>
                    {item.title || "-"}
                  </Typography>
                  {parseEventDetail(item) ? (
                    <Typography sx={{ color: item.postType === "공지" ? "rgba(248,251,255,0.8)" : "var(--muted)", fontSize: 12, mt: 0.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {parseEventDetail(item)}
                    </Typography>
                  ) : null}
                </Box>
                <Stack spacing={0.25} sx={{ minWidth: { xs: "auto", md: 180 }, textAlign: { xs: "left", md: "right" } }}>
                  <Typography sx={{ color: item.postType === "공지" ? "rgba(248,251,255,0.9)" : "var(--muted)", fontSize: 12 }}>
                    작성자 {item.authorName || "-"}
                  </Typography>
                  <Typography sx={{ color: item.postType === "공지" ? "rgba(248,251,255,0.9)" : "var(--muted)", fontSize: 12 }}>
                    {item.eventDate || "-"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}

        {!loading && !visibleItems.length ? (
          <Typography sx={{ color: "var(--muted)", textAlign: "center", py: 3 }}>
            {errorMessage || "등록된 경조사가 없습니다."}
          </Typography>
        ) : null}

        <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => {
              void loadPage(value, keyword);
            }}
            color="primary"
          />
        </Stack>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{editingId ? "경조사 수정" : "경조사 등록"}</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1.25} sx={{ mt: 0.5 }}>
              <TextField label="제목" placeholder="예: 전북대학교 통계학과 김광수 교수 부친상" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} fullWidth required />
              <Tabs
                value={form.type}
                onChange={(_, value: string) => setForm((p) => ({ ...p, type: value }))}
                variant="fullWidth"
                sx={{ border: "1px solid var(--line)", borderRadius: 2, minHeight: 40, "& .MuiTab-root": { minHeight: 40 } }}
              >
                <Tab value="경사" label="경사" />
                <Tab value="조사" label="조사" />
              </Tabs>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <TextField type="date" label="일자" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} fullWidth required />
              </Stack>
              <TextField label="부서" value={myDeptName || "(부서 정보 없음)"} fullWidth InputProps={{ readOnly: true }} />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isNotice}
                    onChange={(e) => setForm((p) => ({ ...p, isNotice: e.target.checked }))}
                  />
                }
                label="공지로 등록"
              />
              <TextField label="작성자" value={currentUser?.fullName || currentUser?.username || "작성자"} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="내용" value={form.detail} onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))} multiline minRows={4} fullWidth />
              <Box sx={{ border: "1px dashed var(--line)", borderRadius: 2, p: 1.25, bgcolor: "rgba(255,255,255,0.65)" }}>
                <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>미리보기</Typography>
                <Typography sx={{ fontWeight: 800, mt: 0.25 }}>
                  {`[${toTypeLabel(form.type || "경사")}] ${form.title.trim() || "제목"}`}
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                  {`작성자: ${currentUser?.fullName || currentUser?.username || "작성자"} · ${myDeptName || "부서"} · ${form.date || "일자"}`}
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25, whiteSpace: "pre-wrap" }}>
                  {form.detail.trim() || "내용을 입력하세요."}
                </Typography>
              </Box>
              {!editingId ? (
                <TextField type="password" label="삭제 비밀번호(4자리 숫자)" value={form.deletePin} onChange={(e) => setForm((p) => ({ ...p, deletePin: e.target.value.replace(/\D/g, "").slice(0, 4) }))} fullWidth inputProps={{ inputMode: "numeric" }} />
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>닫기</Button>
            <Button variant="contained" onClick={() => void submit()}>저장</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm">
          <DialogTitle>경조사 상세</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              <Typography sx={{ fontWeight: 800 }}>
                {detail?.title || "-"}
              </Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                {detail?.eventDate || "-"} · {detail?.departmentName || "-"} · {detail?.postType || "일반"}
              </Typography>
              <Typography>작성자: {detail?.authorName || "-"}</Typography>
              {detail ? <Typography sx={{ whiteSpace: "pre-wrap" }}>{parseEventDetail(detail) || "(내용 없음)"}</Typography> : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetail(null)}>닫기</Button>
            {detail && isOwner(detail) ? (
              <>
                <Button onClick={() => openEdit(detail)}>수정</Button>
                <Button
                  color="error"
                  onClick={() => {
                    setDeletePinInput("");
                    setDeleteOpen(true);
                  }}
                >
                  삭제
                </Button>
              </>
            ) : null}
          </DialogActions>
        </Dialog>

        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>경조사 삭제</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <TextField label="삭제 비밀번호(4자리 숫자)" value={deletePinInput} onChange={(e) => setDeletePinInput(e.target.value.replace(/\D/g, "").slice(0, 4))} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>취소</Button>
            <Button color="error" variant="contained" onClick={() => void remove()}>삭제</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </MainLayout>
  );
}
