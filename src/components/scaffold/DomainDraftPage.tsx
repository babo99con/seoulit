"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type Kpi = {
  label: string;
  value: string;
};

type Section = {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
};

export default function DomainDraftPage({
  title,
  subtitle,
  tags,
  kpis,
  sections,
}: {
  title: string;
  subtitle: string;
  tags: string[];
  kpis: Kpi[];
  sections: Section[];
}) {
  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid var(--line)",
            boxShadow: "var(--shadow-1)",
            background:
              "linear-gradient(120deg, rgba(11, 91, 143, 0.2) 0%, rgba(11, 91, 143, 0) 55%)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={1.25}>
              <Typography sx={{ fontSize: 24, fontWeight: 900 }}>{title}</Typography>
              <Typography sx={{ color: "var(--muted)" }}>{subtitle}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: `repeat(${Math.max(kpis.length, 1)}, 1fr)` },
          }}
        >
          {kpis.map((kpi) => (
            <Card key={kpi.label} sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ color: "var(--muted)", fontSize: 13 }}>{kpi.label}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 24 }}>{kpi.value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Stack spacing={2}>
          {sections.map((section) => (
            <Card key={section.title} sx={{ borderRadius: 3, border: "1px solid var(--line)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 17 }}>{section.title}</Typography>
                <Typography sx={{ color: "var(--muted)", mt: 0.5, mb: 1.5 }}>
                  {section.description}
                </Typography>

                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ minWidth: 640 }}>
                    <TableHead>
                      <TableRow>
                        {section.columns.map((column) => (
                          <TableCell key={column} sx={{ fontWeight: 800 }}>
                            {column}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {section.rows.map((row, index) => (
                        <TableRow key={`${section.title}-${index}`}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={`${section.title}-${index}-${cellIndex}`}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    </MainLayout>
  );
}
