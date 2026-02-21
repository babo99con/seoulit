"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function BoardApprovalsPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/board/notices");
  }, [router]);

  return (
    <MainLayout>
      <Stack spacing={2}>
        <Card sx={{ border: "1px solid var(--line)" }}>
          <CardContent>
            <Typography sx={{ fontWeight: 800 }}>전자결재 메뉴는 비활성화되었습니다.</Typography>
            <Typography sx={{ color: "var(--muted)", mt: 0.5 }}>잠시 후 공지사항으로 이동합니다.</Typography>
            <Button sx={{ mt: 1 }} variant="outlined" onClick={() => router.replace("/board/notices")}>지금 이동</Button>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
