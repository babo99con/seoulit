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
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getSessionUser } from "@/lib/session";
import {
  createStaffBoardPostApi,
  deleteStaffBoardPostApi,
  fetchStaffBoardPostApi,
  fetchStaffBoardPageApi,
  type StaffBoardPost,
  updateStaffBoardPostApi,
} from "@/lib/staffBoardApi";

const PAGE_SIZE = 10;
const PINNED_NOTICE_COUNT = 5;

export default function StaffNoticesPage() {
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
  const [hideNotices, setHideNotices] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    tag: "공지",
    date: "",
    content: "",
    deletePin: "",
  });

  const visibleItems = React.useMemo(() => {
    const notices = items.filter((item) => item.postType === "공지" || item.postType === "필독");
    const normals = items.filter((item) => item.postType !== "공지" && item.postType !== "필독");

    if (hideNotices) {
      const start = (page - 1) * PAGE_SIZE;
      return normals.slice(start, start + PAGE_SIZE);
    }

    const pinned = notices.slice(0, PINNED_NOTICE_COUNT);
    const normalSlots = Math.max(1, PAGE_SIZE - pinned.length);
    const normalStart = (page - 1) * normalSlots;
    return [...pinned, ...normals.slice(normalStart, normalStart + normalSlots)];
  }, [hideNotices, items, page]);

  const loadPage = React.useCallback(async (nextPage: number, nextKeyword: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchStaffBoardPageApi({
        category: "NOTICE",
        keyword: nextKeyword,
        page: 0,
        size: 500,
      });
      const rows = result.items || [];
      const noticeCount = rows.filter((item) => item.postType === "공지" || item.postType === "필독").length;
      const normalCount = rows.length - noticeCount;
      const pinnedCount = hideNotices ? 0 : Math.min(PINNED_NOTICE_COUNT, noticeCount);
      const normalSlots = hideNotices ? PAGE_SIZE : Math.max(1, PAGE_SIZE - pinnedCount);
      const totalPages = Math.max(1, Math.ceil(normalCount / normalSlots));

      setItems(rows);
      setPage(Math.min(nextPage, totalPages));
      setPageCount(totalPages);
    } catch (error) {
      setItems([]);
      setPageCount(1);
      setErrorMessage(error instanceof Error ? error.message : "공지사항을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [hideNotices]);

  React.useEffect(() => {
    void loadPage(1, keyword);
  }, [hideNotices, keyword, loadPage]);

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
      tag: "공지",
      date: new Date().toISOString().slice(0, 10),
      content: "",
      deletePin: "",
    });
    setOpen(true);
  };

  const openEdit = (item: StaffBoardPost) => {
    if (!isOwner(item)) return;
    setEditingId(item.id);
    setForm({
      title: item.title,
      tag: item.postType || "공지",
      date: item.eventDate || "",
      content: item.content || "",
      deletePin: "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim()) return;
    if (!editingId && !/^\d{4}$/.test(form.deletePin)) {
      window.alert("삭제 비밀번호는 4자리 숫자로 입력해 주세요.");
      return;
    }

    try {
      const req = {
        postType: form.tag,
        title: form.title.trim(),
        content: form.content.trim(),
        eventDate: form.date,
        authorId: currentUser?.username || "",
        authorName: currentUser?.fullName || currentUser?.username || "작성자",
        deletePin: editingId ? undefined : form.deletePin,
      };
      if (editingId) {
        await updateStaffBoardPostApi("NOTICE", editingId, req);
      } else {
        await createStaffBoardPostApi("NOTICE", req);
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
      await deleteStaffBoardPostApi("NOTICE", detail.id, deletePinInput);
      setDeleteOpen(false);
      setDetail(null);
      setDeletePinInput("");
      await loadPage(page, keyword);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  };

  const openDetail = async (item: StaffBoardPost) => {
    try {
      const found = await fetchStaffBoardPostApi("NOTICE", item.id);
      setDetail(found);
    } catch {
      setDetail(item);
    }
  };

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 900 }}>공지사항</Typography>
            <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>전 직원 공지와 일반 게시글을 관리합니다.</Typography>
          </Box>
          <Button variant="contained" onClick={openCreate}>등록</Button>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="제목/내용 검색"
            fullWidth
          />
          <FormControlLabel
            control={<Checkbox checked={hideNotices} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHideNotices(e.target.checked)} />}
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
          <Card
            key={item.id}
            onClick={() => void openDetail(item)}
            sx={{
              borderRadius: 2,
              border: item.postType === "필독" || item.postType === "공지" ? "1px solid #1e3a5f" : "1px solid var(--line)",
              cursor: "pointer",
              bgcolor: item.postType === "필독" || item.postType === "공지" ? "#244a75" : "#ffffff",
            }}
          >
            <CardContent sx={{ py: 1.25, px: 1.75, "&:last-child": { pb: 1.25 } }}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.25}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 20, color: item.postType === "필독" || item.postType === "공지" ? "#f8fbff" : "inherit" }}>
                    {item.postType === "필독"
                      ? `[필독] ${item.title}`
                      : item.postType === "공지"
                      ? `[공지] ${item.title}`
                      : item.title}
                  </Typography>
                  <Typography sx={{ color: item.postType === "필독" || item.postType === "공지" ? "rgba(248,251,255,0.82)" : "var(--muted)", fontSize: 12, mt: 0.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.content || "(내용 없음)"}
                  </Typography>
                </Box>
                <Stack spacing={0.25} sx={{ minWidth: { xs: "auto", md: 210 }, textAlign: { xs: "left", md: "right" } }}>
                  <Typography sx={{ color: item.postType === "필독" || item.postType === "공지" ? "rgba(248,251,255,0.9)" : "var(--muted)", fontSize: 12 }}>
                    작성자 {item.authorName || "-"}
                  </Typography>
                  <Typography sx={{ color: item.postType === "필독" || item.postType === "공지" ? "rgba(248,251,255,0.9)" : "var(--muted)", fontSize: 12 }}>
                    게시일 {item.eventDate || "-"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}

        {!loading && !visibleItems.length ? (
          <Typography sx={{ color: "var(--muted)", textAlign: "center", py: 3 }}>
            {errorMessage || "등록된 공지사항이 없습니다."}
          </Typography>
        ) : null}

        <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => {
              setPage(value);
            }}
            color="primary"
          />
        </Stack>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{editingId ? "공지사항 수정" : "공지사항 등록"}</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1.25} sx={{ mt: 0.5 }}>
              <TextField select label="구분" value={form.tag} onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))} fullWidth>
                <MenuItem value="필독">필독</MenuItem>
                <MenuItem value="공지">공지</MenuItem>
                <MenuItem value="일반">일반</MenuItem>
              </TextField>
              <TextField label="제목" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} fullWidth />
              <TextField type="date" label="게시일" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} fullWidth />
              <TextField label="내용" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} multiline minRows={4} fullWidth />
              <TextField label="작성자" value={currentUser?.fullName || currentUser?.username || "작성자"} fullWidth InputProps={{ readOnly: true }} />
              <Box sx={{ border: "1px dashed var(--line)", borderRadius: 2, p: 1.25, bgcolor: "rgba(255,255,255,0.65)" }}>
                <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>미리보기</Typography>
                <Typography sx={{ fontWeight: 800, mt: 0.25 }}>
                  {`[${form.tag || "구분"}] ${form.title.trim() || "제목"}`}
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                  {`작성자: ${currentUser?.fullName || currentUser?.username || "작성자"} · 게시일: ${form.date || "일자"}`}
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25, whiteSpace: "pre-wrap" }}>
                  {form.content.trim() || "내용을 입력하세요."}
                </Typography>
              </Box>
              {!editingId ? (
                <TextField
                  type="password"
                  label="삭제 비밀번호(4자리 숫자)"
                  value={form.deletePin}
                  onChange={(e) => setForm((p) => ({ ...p, deletePin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  inputProps={{ inputMode: "numeric" }}
                  fullWidth
                />
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>닫기</Button>
            <Button variant="contained" onClick={() => void submit()}>저장</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm">
          <DialogTitle>공지 상세</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              <Typography sx={{ fontWeight: 800 }}>{detail?.title}</Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                구분 {detail?.postType || "일반"} · 작성자 {detail?.authorName || "-"} · 게시일 {detail?.eventDate || "-"}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{detail?.content || "(내용 없음)"}</Typography>
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
          <DialogTitle>공지 삭제</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <TextField
              type="password"
              label="삭제 비밀번호(4자리 숫자)"
              value={deletePinInput}
              onChange={(e) => setDeletePinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputProps={{ inputMode: "numeric" }}
              fullWidth
            />
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
