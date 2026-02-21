"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, Stack, Typography } from "@mui/material";

export default function BoardHandoverPage() {
  return (
    <MainLayout>
      <Stack spacing={2}>
        <Typography sx={{ fontSize: 24, fontWeight: 900 }}>인계노트</Typography>
        <Card sx={{ border: "1px solid var(--line)" }}>
          <CardContent>
            <Typography sx={{ fontWeight: 800 }}>교대 인계 로그</Typography>
            <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>교대 시 환자 상태/주의사항/후속조치 인계를 팀 단위로 기록하고 조회하는 공통 모듈 자리입니다.</Typography>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
