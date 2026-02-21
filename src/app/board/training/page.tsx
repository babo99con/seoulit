"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

export default function BoardTrainingPage() {
  return (
    <MainLayout>
      <Stack spacing={2}>
        <Typography sx={{ fontSize: 24, fontWeight: 900 }}>교육/이수</Typography>
        <Card sx={{ border: "1px solid var(--line)" }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontWeight: 800 }}>필수교육 이수율</Typography>
              <Chip size="small" color="warning" label="미이수 3건" />
            </Stack>
            <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>법정의무교육/감염관리교육 대상자 지정, 이수 등록, 미이수 알림을 위한 공통 모듈 자리입니다.</Typography>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
