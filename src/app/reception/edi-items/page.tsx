"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Typography } from "@mui/material";
import * as React from "react";

type Kind = "pharmacy" | "cmcd" | "diagnoss";

type EdiRow = {
  id: number;
  code: string;
  name: string;
  divNo: string;
  unitPrice: number;
  applyDate: string;
  raw?: Record<string, unknown>;
};

export default function ReceptionEdiItemsPage() {
  const [kind, setKind] = React.useState<Kind>("pharmacy");
  const [mdfeeCd, setMdfeeCd] = React.useState("");
  const [mdfeeDivNo, setMdfeeDivNo] = React.useState("");
  const [korNm, setKorNm] = React.useState("");
  const [rows, setRows] = React.useState<EdiRow[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [pageNo, setPageNo] = React.useState(1);
  const [numOfRows, setNumOfRows] = React.useState(50);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<EdiRow | null>(null);
  const requestSeqRef = React.useRef(0);

  const resolveRawCode = (row?: EdiRow | null) => {
    if (!row?.raw) return "-";
    const entries = Object.entries(row.raw);
    const found = entries.find(([k, v]) => /mdfee.*cd|suga.*code|edi.*code|(^|_)code$/i.test(k) && typeof v === "string" && v.trim());
    return found ? String(found[1]).trim() : "-";
  };

  const exampleByKind = React.useMemo(() => {
    if (kind === "pharmacy") {
      return { mdfeeCd: "Z3000030", mdfeeDivNo: "약", korNm: "지도" };
    }
    if (kind === "cmcd") {
      return { mdfeeCd: "10100011", mdfeeDivNo: "가1가", korNm: "초진진찰료" };
    }
    return { mdfeeCd: "M6561", mdfeeDivNo: "자656가", korNm: "경피적관상동맥스텐트삽입술" };
  }, [kind]);

  const load = React.useCallback(async (q?: { kind?: Kind; mdfeeCd?: string; mdfeeDivNo?: string; korNm?: string; pageNo?: number; numOfRows?: number }) => {
    const seq = ++requestSeqRef.current;
    const nextKind = q?.kind || kind;
    const nextPage = q?.pageNo ?? pageNo;
    const nextSize = q?.numOfRows ?? numOfRows;
    const params = new URLSearchParams({
      kind: nextKind,
      pageNo: String(nextPage),
      numOfRows: String(nextSize),
    });
    if (q?.mdfeeCd ?? mdfeeCd) params.set("mdfeeCd", (q?.mdfeeCd ?? mdfeeCd).trim());
    if (q?.mdfeeDivNo ?? mdfeeDivNo) params.set("mdfeeDivNo", (q?.mdfeeDivNo ?? mdfeeDivNo).trim());
    if (q?.korNm ?? korNm) params.set("korNm", (q?.korNm ?? korNm).trim());

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/edi-items?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        const extra = json?.raw ? ` / ${String(json.raw).slice(0, 120)}` : "";
        throw new Error((json?.message || "EDI 조회 실패") + extra);
      }
      if (seq !== requestSeqRef.current) return;
      setRows((json.result.items || []) as EdiRow[]);
      setTotalCount(Number(json.result.totalCount || 0));
    } catch (e) {
      if (seq !== requestSeqRef.current) return;
      setRows([]);
      setTotalCount(0);
      setError(e instanceof Error ? e.message : "EDI 조회 실패");
    } finally {
      if (seq !== requestSeqRef.current) return;
      setLoading(false);
    }
  }, [kind, mdfeeCd, mdfeeDivNo, korNm, pageNo, numOfRows]);

  const handleKind = (next: Kind) => {
    const example = next === "pharmacy"
      ? { mdfeeCd: "Z3000030", mdfeeDivNo: "약", korNm: "지도" }
      : next === "cmcd"
      ? { mdfeeCd: "10100011", mdfeeDivNo: "가1가", korNm: "초진진찰료" }
      : { mdfeeCd: "M6561", mdfeeDivNo: "자656가", korNm: "경피적관상동맥스텐트삽입술" };
    setKind(next);
    setMdfeeCd(example.mdfeeCd);
    setMdfeeDivNo(example.mdfeeDivNo);
    setKorNm(example.korNm);
    setRows([]);
    setTotalCount(0);
    setPageNo(1);
    setError(null);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / Math.max(1, numOfRows)));
  const pageWindowStart = Math.max(1, pageNo - 5);
  const pageWindowEnd = Math.min(totalPages, pageNo + 5);
  const pageWindow = Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, i) => pageWindowStart + i);

  const handleDownloadExcel = React.useCallback(() => {
    if (!rows.length) {
      window.alert("다운로드할 조회 결과가 없습니다.");
      return;
    }

    const escapeCsv = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const header = ["수가코드", "수가명", "분류번호", "단가", "적용일"];
    const data = rows.map((item) => [
      item.code || "",
      item.name || "",
      item.divNo || "",
      item.unitPrice || 0,
      item.applyDate || "",
    ]);
    const csv = [header, ...data].map((line) => line.map((cell) => escapeCsv(cell)).join(",")).join("\r\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const labelByKind: Record<Kind, string> = {
      pharmacy: "약국",
      cmcd: "한방",
      diagnoss: "진료",
    };
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `EDI_${labelByKind[kind]}_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [kind, rows]);

  React.useEffect(() => {
    setMdfeeCd(exampleByKind.mdfeeCd);
    setMdfeeDivNo(exampleByKind.mdfeeDivNo);
    setKorNm(exampleByKind.korNm);
  }, [exampleByKind]);

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Typography sx={{ fontSize: 24, fontWeight: 900 }}>EDI 아이템</Typography>

        <Card sx={{ border: "1px solid var(--line)" }}>
          <CardContent>
            <Tabs
              value={kind}
              onChange={(_, value: Kind) => {
                void handleKind(value);
              }}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{
                minHeight: 42,
                "& .MuiTab-root": {
                  minHeight: 42,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2,
                },
                mb: 3,
              }}
            >
              <Tab value="pharmacy" label="약국" />
              <Tab value="cmcd" label="한방" />
              <Tab value="diagnoss" label="진료" />
            </Tabs>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} sx={{ mt: 1 }}>
              <TextField size="small" label="수가코드(mdfeeCd)" value={mdfeeCd} onChange={(e) => setMdfeeCd(e.target.value)} fullWidth />
              <TextField size="small" label="분류번호(mdfeeDivNo)" value={mdfeeDivNo} onChange={(e) => setMdfeeDivNo(e.target.value)} fullWidth />
              <TextField size="small" label="수가명(korNm)" value={korNm} onChange={(e) => setKorNm(e.target.value)} fullWidth />
              <TextField
                select
                SelectProps={{ native: true }}
                size="small"
                label="표시 건수"
                value={numOfRows}
                onChange={(e) => {
                  const next = Number(e.target.value || 50);
                  setNumOfRows(next);
                  setPageNo(1);
                }}
                sx={{ minWidth: 120 }}
              >
                <option value={10}>10건</option>
                <option value={30}>30건</option>
                <option value={50}>50건</option>
                <option value={70}>70건</option>
                <option value={100}>100건</option>
              </TextField>
              <Button
                variant="contained"
                onClick={() => {
                  if (!mdfeeCd.trim() && !mdfeeDivNo.trim() && !korNm.trim()) {
                    window.alert("수가코드, 분류번호, 수가명 중 최소 1개는 입력해 주세요.");
                    return;
                  }
                  setPageNo(1);
                  void load({ pageNo: 1 });
                }}
              >
                검색
              </Button>
            </Stack>
            {loading ? <Typography sx={{ mt: 1, fontSize: 12, color: "var(--muted)" }}>데이터를 불러오는 중입니다...</Typography> : null}
          </CardContent>
        </Card>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Card sx={{ border: "1px solid var(--line)" }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 800 }}>조회 결과</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label={`표시 ${rows.length}건 / 전체 ${totalCount}건`} />
                <Typography sx={{ fontSize: 12, color: "var(--muted)" }}>{pageNo} / {totalPages} 페이지</Typography>
                <Button size="small" variant="outlined" onClick={handleDownloadExcel} disabled={loading || rows.length === 0}>
                  엑셀 다운로드
                </Button>
              </Stack>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">수가코드</TableCell>
                  <TableCell>수가명</TableCell>
                  <TableCell align="center">분류번호</TableCell>
                  <TableCell align="center">단가</TableCell>
                  <TableCell align="center">적용일</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading ? rows.map((item) => (
                  <TableRow key={`${item.code}-${item.id}`} hover sx={{ cursor: "pointer" }} onClick={() => setDetail(item)}>
                    <TableCell align="center">{item.code || "-"}</TableCell>
                    <TableCell sx={{ maxWidth: 460, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={item.name || "-"}>
                      {item.name || "-"}
                    </TableCell>
                    <TableCell align="center">{item.divNo || "-"}</TableCell>
                    <TableCell align="center">{(item.unitPrice || 0).toLocaleString()}</TableCell>
                    <TableCell align="center">{item.applyDate || "-"}</TableCell>
                  </TableRow>
                )) : null}
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography sx={{ color: "var(--muted)", textAlign: "center" }}>데이터를 불러오는 중입니다...</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!loading && !rows.length ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography sx={{ color: "var(--muted)", textAlign: "center" }}>검색 결과가 없습니다.</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            <Box sx={{ mt: 1, width: "100%", display: "flex", justifyContent: "center" }}>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button
                  size="small"
                  variant="outlined"
                  disabled={loading || pageNo <= 1}
                  onClick={() => {
                    const next = 1;
                    setPageNo(next);
                    void load({ pageNo: next });
                  }}
                >
                  처음
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={loading || pageNo <= 1}
                  onClick={() => {
                    const next = Math.max(1, pageNo - 1);
                    setPageNo(next);
                    void load({ pageNo: next });
                  }}
                >
                  이전
                </Button>
                {pageWindow.map((p) => (
                  <Button
                    key={p}
                    size="small"
                    variant={p === pageNo ? "contained" : "outlined"}
                    disabled={loading}
                    onClick={() => {
                      if (p === pageNo) return;
                      setPageNo(p);
                      void load({ pageNo: p });
                    }}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  size="small"
                  variant="outlined"
                  disabled={loading || pageNo >= totalPages}
                  onClick={() => {
                    const next = Math.min(totalPages, pageNo + 1);
                    setPageNo(next);
                    void load({ pageNo: next });
                  }}
                >
                  다음
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={loading || pageNo >= totalPages}
                  onClick={() => {
                    const next = totalPages;
                    setPageNo(next);
                    void load({ pageNo: next });
                  }}
                >
                  마지막
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="md">
          <DialogTitle>EDI 아이템 상세</DialogTitle>
          <DialogContent>
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              <Typography>수가코드: {detail?.code || resolveRawCode(detail)}</Typography>
              <Typography>수가명: {detail?.name || "-"}</Typography>
              <Typography>분류번호: {detail?.divNo || "-"}</Typography>
              <Typography>단가: {(detail?.unitPrice || 0).toLocaleString()}</Typography>
              <Typography>적용일: {detail?.applyDate || "-"}</Typography>
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
