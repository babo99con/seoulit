"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Alert,
  Box,
  Paper,
  Stack,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { fetchAllVisitHistoryApi, type VisitHistory } from "@/lib/visitHistoryApi";
import { toHistoryEventLabel } from "@/lib/historyLabels";

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

export default function ReceptionHistoryPage() {
  const [list, setList] = React.useState<VisitHistory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [keyword, setKeyword] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllVisitHistoryApi();
        if (alive) setList(data);
      } catch (err) {
        if (alive) setError("접수 변경 이력을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return list;
    return list.filter((item) => {
      return (
        String(item.visitId ?? "").includes(k) ||
        (item.eventType ?? "").toLowerCase().includes(k) ||
        toHistoryEventLabel(item.eventType).toLowerCase().includes(k) ||
        (item.fieldName ?? "").toLowerCase().includes(k) ||
        (item.oldValue ?? "").toLowerCase().includes(k) ||
        (item.newValue ?? "").toLowerCase().includes(k) ||
        (item.reason ?? "").toLowerCase().includes(k) ||
        (item.changedBy ?? "").toLowerCase().includes(k)
      );
    });
  }, [list, keyword]);

  return (
    <MainLayout>
      <Box>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={900}>
                접수 변경 이력
              </Typography>
              <Typography variant="body2" color="text.secondary">
                접수 상태/예약/응급/입원 변경 기록
              </Typography>
            </Box>
            <TextField
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              size="small"
              placeholder="방문 ID/이벤트/필드 검색"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Paper>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Paper elevation={0} sx={{ p: 2, borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>시간</TableCell>
                <TableCell>방문ID</TableCell>
                <TableCell>이벤트</TableCell>
                <TableCell>필드</TableCell>
                <TableCell>변경 전</TableCell>
                <TableCell>변경 후</TableCell>
                <TableCell>사유</TableCell>
                <TableCell>변경자</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography color="text.secondary">불러오는 중...</Typography>
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography color="text.secondary">
                      표시할 이력이 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}

              {filtered.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{formatDateTime(item.changedAt)}</TableCell>
                  <TableCell>{item.visitId}</TableCell>
                  <TableCell>{toHistoryEventLabel(item.eventType)}</TableCell>
                  <TableCell>{item.fieldName ?? "-"}</TableCell>
                  <TableCell>{item.oldValue ?? "-"}</TableCell>
                  <TableCell>{item.newValue ?? "-"}</TableCell>
                  <TableCell>{item.reason ?? "-"}</TableCell>
                  <TableCell>{item.changedBy ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </MainLayout>
  );
}
