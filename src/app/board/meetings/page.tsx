"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function BoardMeetingsPage() {
  return (
    <MainLayout>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: 24, fontWeight: 900 }}>회의/위원회</Typography>
          <Button variant="contained">회의록 등록</Button>
        </Stack>
        <Card sx={{ border: "1px solid var(--line)" }}>
          <CardContent>
            <Typography sx={{ fontWeight: 800 }}>회의록 아카이브</Typography>
            <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>위원회/운영회의 회의록, 참석자, 후속 액션 추적을 위한 공통 모듈 자리입니다.</Typography>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
