"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";

export default function BillingPage() {
  return (
    <MainLayout>
      <Box sx={{ display: "grid", gap: 2 }}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(245, 158, 11, 0.14)",
                  color: "#b45309",
                }}
              >
                <MonetizationOnOutlinedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 20 }}>
                  수납 대시보드
                </Typography>
                <Typography sx={{ color: "var(--muted)", fontSize: 14 }}>
                  수납/결제/보험 처리를 여기서 관리합니다.
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ color: "var(--muted)" }}>
              기능을 추가할 영역입니다.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}
