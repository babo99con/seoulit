"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

const parseEventType = (item: StaffBoardPost) => {
  if (!item.content) return "";
  if (item.content.startsWith("TYPE:")) return item.content.slice(5).trim();
  return item.content;
};

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
  const [form, setForm] = React.useState({
    name: "",
    type: "",
    date: "",
    dept: "",
    tag: "공지",
    author: "",
    deletePin: "",
  });

  const loadPage = React.useCallback(async (nextPage: number, nextKeyword: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchStaffBoardPageApi({
        category: "EVENT",
        keyword: nextKeyword,
        page: nextPage - 1,
        size: PAGE_SIZE,
      });
      setItems(result.items || []);
      setPage(result.page + 1);
      setPageCount(Math.max(1, result.totalPages || 1));
    } catch (error) {
      setItems([]);
      setPageCount(1);
      setErrorMessage(error instanceof Error ? error.message : "경조사를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadPage(1, "");
  }, [loadPage]);

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
      name: "",
      type: "",
      date: new Date().toISOString().slice(0, 10),
      dept: "",
      tag: "공지",
      author: currentUser?.fullName || currentUser?.username || "작성자",
      deletePin: "",
    });
    setOpen(true);
  };

  const openEdit = (item: StaffBoardPost) => {
    if (!isOwner(item)) return;
    setEditingId(item.id);
    setForm({
      name: item.subjectName || "",
      type: parseEventType(item),
      date: item.eventDate || "",
      dept: item.departmentName || "",
      tag: item.postType || "공지",
      author: item.authorName,
      deletePin: "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.type.trim()) return;
    if (!editingId && !/^\d{4}$/.test(form.deletePin)) {
      window.alert("삭제 비밀번호는 4자리 숫자로 입력해 주세요.");
      return;
    }

    try {
      const req = {
        postType: form.tag,
        title: `${form.name.trim()} · ${form.type.trim()}`,
        content: `TYPE:${form.type.trim()}`,
        eventDate: form.date,
        subjectName: form.name.trim(),
        departmentName: form.dept.trim(),
        authorId: currentUser?.username || "",
        authorName: form.author.trim() || currentUser?.fullName || currentUser?.username || "작성자",
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

        <Stack direction="row" spacing={1}>
          <TextField
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="이름/구분/부서 검색"
            fullWidth
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

        {items.map((item) => (
          <Card key={item.id} onClick={async () => {
            try {
              const found = await fetchStaffBoardPostApi("EVENT", item.id);
              setDetail(found);
            } catch {
              setDetail(item);
            }
          }} sx={{ borderRadius: 2, border: "1px solid var(--line)", cursor: "pointer" }}>
            <CardContent sx={{ py: 1.25, px: 1.75, "&:last-child": { pb: 1.25 } }}>
              <Typography sx={{ fontWeight: 800 }}>
                {(item.subjectName || "-") + " · " + (parseEventType(item) || "-")}
              </Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                {item.eventDate || "-"} · {item.departmentName || "-"}
              </Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 12, mt: 0.25 }}>
                No.{item.id} · {item.postType || "일반"} · 작성자 {item.authorName} · 등록 {item.createdAt || "-"}
              </Typography>
            </CardContent>
          </Card>
        ))}

        {!loading && !items.length ? (
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
              <TextField label="이름" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} fullWidth />
              <TextField label="구분" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} fullWidth />
              <TextField type="date" label="일자" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} fullWidth />
              <TextField label="부서" value={form.dept} onChange={(e) => setForm((p) => ({ ...p, dept: e.target.value }))} fullWidth />
              <TextField select label="공지 여부" value={form.tag} onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))} fullWidth>
                <MenuItem value="공지">공지</MenuItem>
                <MenuItem value="일반">일반</MenuItem>
              </TextField>
              <TextField label="작성자" value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} fullWidth />
              {!editingId ? (
                <TextField label="삭제 비밀번호(4자리 숫자)" value={form.deletePin} onChange={(e) => setForm((p) => ({ ...p, deletePin: e.target.value.replace(/\D/g, "").slice(0, 4) }))} fullWidth />
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
                {(detail?.subjectName || "-") + " · " + (detail ? parseEventType(detail) : "-")}
              </Typography>
              <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>
                {detail?.eventDate || "-"} · {detail?.departmentName || "-"} · {detail?.postType || "일반"}
              </Typography>
              <Typography>작성자: {detail?.authorName || "-"}</Typography>
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
