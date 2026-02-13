"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { loginApi } from "@/lib/authApi";
import { saveSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await loginApi({ username, password });
      saveSession(result.accessToken, result.user);
      const params = new URLSearchParams(window.location.search);
      const nextPath = params.get("next") || "/reception";
      router.push(nextPath);
    } catch {
      setError("로그인에 실패했습니다. 아이디/비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        backgroundImage:
          "radial-gradient(circle at 12% 8%, rgba(11, 91, 143, 0.18) 0%, rgba(11, 91, 143, 0) 38%), radial-gradient(circle at 88% 12%, rgba(217, 119, 6, 0.16) 0%, rgba(217, 119, 6, 0) 32%), linear-gradient(180deg, #eef3f7 0%, #f7fafc 55%, #eef2f7 100%)",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 460, borderRadius: 3, boxShadow: "var(--shadow-1)" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: 26, fontWeight: 900, color: "var(--brand-strong)" }}>
                HIS 로그인
              </Typography>
              <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>
                JWT 기반 인증으로 로그인 후 권한별 화면을 사용하세요.
              </Typography>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              label="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
            <TextField
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading || !username || !password}
              sx={{ bgcolor: "var(--brand)", py: 1.1, fontWeight: 700 }}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>

          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
