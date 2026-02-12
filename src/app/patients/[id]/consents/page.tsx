"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import {
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
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import {
  createConsentTypeApi,
  deactivateConsentTypeApi,
  fetchConsentLatestApi,
  fetchConsentWithdrawHistoryApi,
  fetchConsentTypesApi,
  fetchConsentTypesAllApi,
  updateConsentTypeApi,
  type ConsentWithdrawHistory,
  type ConsentLatest,
  type ConsentType,
} from "@/lib/consentApi";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { consentActions } from "@/features/consent/consentSlice";
import type { Consent } from "@/features/consent/consentTypes";

type ConsentFormState = {
  consentType: string;
  note: string;
  activeYn: boolean;
  file: File | null;
  agreedAt: string;
};

function resolveFileUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base =
    process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ?? "http://localhost:8081";
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function toOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function normalizeAgreedAtForInput(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.includes("T")) return trimmed.slice(0, 16);
  if (trimmed.includes(" ")) return trimmed.replace(" ", "T").slice(0, 16);
  return trimmed;
}

function normalizeAgreedAtForSubmit(value: string) {
  const v = value.trim();
  if (!v) return undefined;
  return v.length === 16 ? `${v}:00` : v;
}

export default function PatientConsentsPage() {
  const params = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const patientId = Number(params.id);

  const {
    list: consentList,
    loading: consentLoading,
    error: consentError,
  } = useSelector((s: RootState) => s.consent);
  const [consentDialogOpen, setConsentDialogOpen] = React.useState(false);
  const [consentDialogMode, setConsentDialogMode] = React.useState<
    "create" | "edit"
  >("create");
  const [editingConsent, setEditingConsent] = React.useState<Consent | null>(null);
  const [consentForm, setConsentForm] = React.useState<ConsentFormState>({
    consentType: "",
    note: "",
    activeYn: true,
    file: null,
    agreedAt: "",
  });
  const [consentTypes, setConsentTypes] = React.useState<ConsentType[]>([]);
  const [consentTypesAll, setConsentTypesAll] = React.useState<ConsentType[]>([]);
  const [typeLoading, setTypeLoading] = React.useState(false);
  const [typeError, setTypeError] = React.useState<string | null>(null);

  const filteredConsentList = React.useMemo(
    () => consentList.filter((item) => item.patientId === patientId),
    [consentList, patientId]
  );
  const typeNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const t of consentTypesAll) {
      map.set(t.code, t.name);
    }
    return map;
  }, [consentTypesAll]);

  const [latestList, setLatestList] = React.useState<ConsentLatest[]>([]);
  const [latestLoading, setLatestLoading] = React.useState(false);
  const [latestError, setLatestError] = React.useState<string | null>(null);

  const [withdrawList, setWithdrawList] = React.useState<ConsentWithdrawHistory[]>([]);
  const [withdrawLoading, setWithdrawLoading] = React.useState(false);
  const [withdrawError, setWithdrawError] = React.useState<string | null>(null);

  const [typeDialogOpen, setTypeDialogOpen] = React.useState(false);
  const [typeDialogMode, setTypeDialogMode] = React.useState<"create" | "edit">(
    "create"
  );
  const [editingType, setEditingType] = React.useState<ConsentType | null>(null);
  const [typeForm, setTypeForm] = React.useState({
    code: "",
    name: "",
    sortOrder: "",
  });

  React.useEffect(() => {
    dispatch(consentActions.clearConsent());
    dispatch(consentActions.fetchConsentRequest({ patientId }));
  }, [dispatch, patientId]);

  const loadConsentTypes = React.useCallback(async () => {
    try {
      setTypeLoading(true);
      setTypeError(null);
      const [active, all] = await Promise.all([
        fetchConsentTypesApi(),
        fetchConsentTypesAllApi(),
      ]);
      setConsentTypes(active);
      setConsentTypesAll(all);
    } catch (err) {
      setTypeError(err instanceof Error ? err.message : "동의서 유형 조회 실패");
    } finally {
      setTypeLoading(false);
    }
  }, []);

  const loadLatest = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setLatestLoading(true);
      setLatestError(null);
      const list = await fetchConsentLatestApi(patientId);
      setLatestList(list);
    } catch (err) {
      setLatestError(
        err instanceof Error ? err.message : "최신 동의 상태 조회 실패"
      );
    } finally {
      setLatestLoading(false);
    }
  }, [patientId]);

  const loadWithdrawHistory = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setWithdrawLoading(true);
      setWithdrawError(null);
      const list = await fetchConsentWithdrawHistoryApi(patientId);
      setWithdrawList(list);
    } catch (err) {
      setWithdrawError(
        err instanceof Error ? err.message : "동의 철회 이력 조회 실패"
      );
    } finally {
      setWithdrawLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    loadConsentTypes();
  }, [loadConsentTypes]);

  React.useEffect(() => {
    loadLatest();
  }, [loadLatest, filteredConsentList.length]);

  React.useEffect(() => {
    loadWithdrawHistory();
  }, [loadWithdrawHistory, filteredConsentList.length]);

  const openCreateConsent = () => {
    setConsentDialogMode("create");
    setEditingConsent(null);
    setConsentForm({
      consentType: "",
      note: "",
      activeYn: true,
      file: null,
      agreedAt: "",
    });
    setConsentDialogOpen(true);
  };

  const openEditConsent = (item: Consent) => {
    setConsentDialogMode("edit");
    setEditingConsent(item);
    setConsentForm({
      consentType: item.consentType ?? "",
      note: item.note ?? "",
      activeYn: Boolean(item.activeYn),
      file: null,
      agreedAt: normalizeAgreedAtForInput(item.agreedAt),
    });
    setConsentDialogOpen(true);
  };

  const closeConsentDialog = () => {
    setConsentDialogOpen(false);
  };

  const openTypeDialog = () => {
    setTypeDialogMode("create");
    setEditingType(null);
    setTypeForm({ code: "", name: "", sortOrder: "" });
    setTypeDialogOpen(true);
  };

  const openEditType = (item: ConsentType) => {
    setTypeDialogMode("edit");
    setEditingType(item);
    setTypeForm({
      code: item.code,
      name: item.name,
      sortOrder: String(item.sortOrder ?? ""),
    });
    setTypeDialogOpen(true);
  };

  const closeTypeDialog = () => setTypeDialogOpen(false);

  const onSubmitType = async () => {
    const code = typeForm.code.trim();
    const name = typeForm.name.trim();
    const sortOrder = typeForm.sortOrder.trim();
    if (!code || !name) return;
    try {
      if (typeDialogMode === "create") {
        await createConsentTypeApi({
          code,
          name,
          sortOrder: sortOrder ? Number(sortOrder) : undefined,
        });
      } else if (editingType) {
        await updateConsentTypeApi(editingType.id, {
          code,
          name,
          sortOrder: sortOrder ? Number(sortOrder) : undefined,
          isActive: editingType.isActive,
        });
      }
      setTypeDialogOpen(false);
      await loadConsentTypes();
    } catch (err) {
      setTypeError(err instanceof Error ? err.message : "동의서 유형 저장 실패");
    }
  };

  const onDeactivateType = async (item: ConsentType) => {
    if (!confirm("해당 유형을 비활성 처리할까요?")) return;
    try {
      await deactivateConsentTypeApi(item.id);
      await loadConsentTypes();
    } catch (err) {
      setTypeError(err instanceof Error ? err.message : "동의서 유형 비활성 실패");
    }
  };

  const onSubmitConsent = () => {
    if (!patientId) return;
    if (consentDialogMode === "create") {
      if (!consentForm.consentType.trim()) return;
      dispatch(
        consentActions.createConsentRequest({
          patientId,
          form: {
            patientId,
            consentType: consentForm.consentType,
            note: toOptional(consentForm.note),
          },
          file: consentForm.file,
        })
      );
      setConsentDialogOpen(false);
      return;
    }

    if (!editingConsent) return;
    dispatch(
      consentActions.updateConsentRequest({
        patientId,
        consentId: editingConsent.consentId,
        form: {
          activeYn: consentForm.activeYn,
          note: toOptional(consentForm.note),
          agreedAt: normalizeAgreedAtForSubmit(consentForm.agreedAt),
        },
        file: consentForm.file,
      })
    );
    setConsentDialogOpen(false);
  };

  const onDeleteConsent = (item: Consent) => {
    if (!patientId) return;
    if (!confirm("동의서를 삭제할까요?")) return;
    dispatch(
      consentActions.deleteConsentRequest({
        patientId,
        consentId: item.consentId,
      })
    );
  };

  return (
    <MainLayout>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography fontWeight={900}>동의서</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" onClick={openTypeDialog}>
                유형 관리
              </Button>
              <Button size="small" variant="outlined" onClick={openCreateConsent}>
                동의서 등록
              </Button>
            </Stack>
          </Stack>

          {consentError && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {consentError}
            </Typography>
          )}

          {typeError && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {typeError}
            </Typography>
          )}

          {latestError && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {latestError}
            </Typography>
          )}

          {withdrawError && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {withdrawError}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 2, flexWrap: "wrap" }}
          >
            <Typography variant="body2" color="text.secondary">
              최신 동의 상태:
            </Typography>
            {latestLoading && (
              <Typography variant="body2" color="text.secondary">
                로딩 중...
              </Typography>
            )}
            {!latestLoading && latestList.length === 0 && (
              <Chip size="small" label="없음" />
            )}
            {!latestLoading &&
              latestList.map((item) => (
                <Chip
                  key={item.consentId}
                  size="small"
                  label={`${typeNameMap.get(item.consentType) ?? item.consentType}: ${
                    item.activeYn ? "활성" : "비활성"
                  }`}
                  color={item.activeYn ? "success" : "default"}
                />
              ))}
          </Stack>

          <Table size="small">
            <TableHead sx={{ bgcolor: "#f4f7fb" }}>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 800,
                    color: "#425366",
                    borderBottom: "1px solid var(--line)",
                  },
                }}
              >
                <TableCell>유형</TableCell>
                <TableCell>동의일시</TableCell>
                <TableCell>철회일시</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>파일</TableCell>
                <TableCell>비고</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consentLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography color="text.secondary">로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!consentLoading && filteredConsentList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography color="text.secondary">등록된 동의서가 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {filteredConsentList.map((item: Consent) => (
                <TableRow key={item.consentId} hover>
                  <TableCell sx={{ fontWeight: 800 }}>
                    {typeNameMap.get(item.consentType) ?? item.consentType}
                  </TableCell>
                  <TableCell>{formatDateTime(item.agreedAt)}</TableCell>
                  <TableCell>{formatDateTime(item.withdrawnAt)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.activeYn ? "활성" : "비활성"}
                      color={item.activeYn ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    {item.fileUrl ? (
                      <Button
                        size="small"
                        variant="text"
                        component="a"
                        href={resolveFileUrl(item.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        보기
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{item.note ?? "-"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => openEditConsent(item)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onDeleteConsent(item)}>
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: 4,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <CardContent>
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            동의 철회 이력
          </Typography>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f4f7fb" }}>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 800,
                    color: "#425366",
                    borderBottom: "1px solid var(--line)",
                  },
                }}
              >
                <TableCell>유형</TableCell>
                <TableCell>철회일시</TableCell>
                <TableCell>처리자</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawLoading && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary">로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!withdrawLoading && withdrawList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary">
                      철회 이력이 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {withdrawList.map((item) => (
                <TableRow key={item.historyId} hover>
                  <TableCell>
                    {typeNameMap.get(item.consentType) ?? item.consentType}
                  </TableCell>
                  <TableCell>{formatDateTime(item.withdrawnAt)}</TableCell>
                  <TableCell>{item.changedBy ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={consentDialogOpen}
        onClose={closeConsentDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>
          {consentDialogMode === "create" ? "동의서 등록" : "동의서 수정"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {consentDialogMode === "create" && consentTypes.length > 0 ? (
              <TextField
                select
                label="동의서 유형"
                value={consentForm.consentType}
                onChange={(e) =>
                  setConsentForm((prev) => ({
                    ...prev,
                    consentType: e.target.value,
                  }))
                }
                fullWidth
                disabled={typeLoading}
              >
                {consentTypes.map((t) => (
                  <MenuItem key={t.id} value={t.code}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="동의서 유형"
                value={consentForm.consentType}
                onChange={(e) =>
                  setConsentForm((prev) => ({
                    ...prev,
                    consentType: e.target.value,
                  }))
                }
                fullWidth
                disabled={consentDialogMode === "edit"}
              />
            )}
            <TextField
              label="비고"
              value={consentForm.note}
              onChange={(e) =>
                setConsentForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" component="label">
                파일 선택
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setConsentForm((prev) => ({
                      ...prev,
                      file: e.target.files?.[0] ?? null,
                    }))
                  }
                />
              </Button>
              <Typography variant="body2" color="text.secondary">
                {consentForm.file?.name ??
                  (editingConsent?.fileUrl ? "기존 파일" : "파일 없음")}
              </Typography>
            </Stack>
            {consentDialogMode === "edit" && (
              <TextField
                label="동의일시"
                type="datetime-local"
                value={consentForm.agreedAt}
                onChange={(e) =>
                  setConsentForm((prev) => ({
                    ...prev,
                    agreedAt: e.target.value,
                  }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}
            {consentDialogMode === "edit" && (
              <FormControlLabel
                control={
                  <Switch
                    checked={consentForm.activeYn}
                    onChange={(e) =>
                      setConsentForm((prev) => ({
                        ...prev,
                        activeYn: e.target.checked,
                      }))
                    }
                  />
                }
                label="활성"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConsentDialog}>취소</Button>
          <Button
            variant="contained"
            onClick={onSubmitConsent}
            disabled={consentLoading || !consentForm.consentType.trim()}
          >
            {consentDialogMode === "create" ? "등록" : "저장"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={typeDialogOpen}
        onClose={closeTypeDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle>동의서 유형 관리</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                label="코드"
                value={typeForm.code}
                onChange={(e) =>
                  setTypeForm((prev) => ({ ...prev, code: e.target.value }))
                }
                fullWidth
                disabled={typeDialogMode === "edit"}
              />
              <TextField
                label="정렬"
                value={typeForm.sortOrder}
                onChange={(e) =>
                  setTypeForm((prev) => ({ ...prev, sortOrder: e.target.value }))
                }
                sx={{ width: 100 }}
              />
            </Stack>
            <TextField
              label="표시명"
              value={typeForm.name}
              onChange={(e) =>
                setTypeForm((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={onSubmitType}
                disabled={typeLoading || !typeForm.code.trim() || !typeForm.name.trim()}
              >
                {typeDialogMode === "create" ? "추가" : "저장"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setTypeDialogMode("create");
                  setEditingType(null);
                  setTypeForm({ code: "", name: "", sortOrder: "" });
                }}
              >
                새로 입력
              </Button>
            </Stack>

            <Divider />

            <Table size="small">
              <TableHead sx={{ bgcolor: "#f4f7fb" }}>
                <TableRow
                  sx={{
                    "& th": {
                      fontWeight: 800,
                      color: "#425366",
                      borderBottom: "1px solid var(--line)",
                    },
                  }}
                >
                  <TableCell>코드</TableCell>
                  <TableCell>표시명</TableCell>
                  <TableCell>정렬</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consentTypesAll.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.code}</TableCell>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.sortOrder ?? "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={t.isActive ? "활성" : "비활성"}
                        color={t.isActive ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => openEditType(t)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => onDeactivateType(t)}
                          disabled={!t.isActive}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {consentTypesAll.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">
                        등록된 유형이 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTypeDialog}>닫기</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
