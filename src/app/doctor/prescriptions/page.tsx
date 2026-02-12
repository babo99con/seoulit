"use client";

import DomainDraftPage from "@/components/scaffold/DomainDraftPage";

export default function PrescriptionsPage() {
  return (
    <DomainDraftPage
      title="처방 / 조제"
      subtitle="처방-처방상세-조제-조제상세까지 이어지는 기본 화면입니다."
      tags={["처방", "처방상세", "조제", "조제상세"]}
      kpis={[
        { label: "오늘 처방", value: "62" },
        { label: "조제 완료", value: "44" },
        { label: "조제 대기", value: "8" },
      ]}
      sections={[
        {
          title: "처방",
          description: "진료/접수 기준 처방 생성 현황",
          columns: ["처방ID", "진료ID", "접수ID", "처방의사", "처방상태"],
          rows: [
            ["RX-3001", "V-5501", "R-8101", "이진료", "ISSUED"],
            ["RX-3002", "V-5502", "R-8102", "김내과", "DISPENSED"],
            ["RX-3003", "V-5503", "R-8091", "박정형", "DISPENSED"],
          ],
        },
        {
          title: "처방상세",
          description: "약품별 용법/용량/횟수/일수",
          columns: ["처방상세ID", "처방ID", "약품명", "용법", "처방일수"],
          rows: [
            ["RXD-9101", "RX-3001", "항히스타민정", "식후", "5"],
            ["RXD-9102", "RX-3001", "보습크림", "1일 2회", "14"],
            ["RXD-9103", "RX-3002", "해열진통제", "필요시", "3"],
          ],
        },
        {
          title: "조제",
          description: "처방별 조제 상태 및 수량",
          columns: ["조제ID", "처방ID", "조제일시", "조제상태", "조제자"],
          rows: [
            ["DP-7001", "RX-3002", "2026-02-12 10:05", "DONE", "약사A"],
            ["DP-7002", "RX-3003", "2026-02-12 09:36", "DONE", "약사B"],
            ["DP-7003", "RX-3001", "-", "WAITING", "-"],
          ],
        },
      ]}
    />
  );
}
