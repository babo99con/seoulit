"use client";

import DomainDraftPage from "@/components/scaffold/DomainDraftPage";

export default function ReceptionBillingPage() {
  return (
    <DomainDraftPage
      title="청구 / 수납 / 결제"
      subtitle="진료청구-수납-결제-환불/미수금 흐름에 대한 기본 화면입니다."
      tags={["진료청구", "청구상세", "수납", "결제", "환불", "미수금"]}
      kpis={[
        { label: "오늘 청구", value: "88" },
        { label: "수납 완료", value: "73" },
        { label: "미수금", value: "11" },
      ]}
      sections={[
        {
          title: "진료청구",
          description: "접수 단위 청구 집계",
          columns: ["청구ID", "접수ID", "청구상태", "총금액", "실청구금액"],
          rows: [
            ["C-9901", "R-8101", "BILLED", "125,000", "112,500"],
            ["C-9902", "R-8102", "PAID", "84,000", "84,000"],
            ["C-9903", "R-8103", "PARTIAL", "71,000", "71,000"],
          ],
        },
        {
          title: "수납 / 결제",
          description: "결제수단 분할 수납 및 승인번호",
          columns: ["수납ID", "청구ID", "수납상태", "총수납금액", "결제상태"],
          rows: [
            ["P-501", "C-9902", "DONE", "84,000", "APPROVED"],
            ["P-502", "C-9903", "PARTIAL", "40,000", "PARTIAL"],
            ["P-503", "C-9901", "WAITING", "0", "PENDING"],
          ],
        },
        {
          title: "환불 / 미수금",
          description: "취소/환불/미수 추적",
          columns: ["구분", "참조ID", "금액", "상태", "처리일시"],
          rows: [
            ["환불", "P-440", "15,000", "DONE", "2026-02-11 16:20"],
            ["수납취소", "P-438", "22,000", "DONE", "2026-02-11 15:51"],
            ["미수금", "C-9901", "112,500", "OPEN", "2026-02-12 10:06"],
          ],
        },
      ]}
    />
  );
}
