"use client";

import DomainDraftPage from "@/components/scaffold/DomainDraftPage";

export default function InsuranceManagementPage() {
  return (
    <DomainDraftPage
      title="보험 / 보험이력"
      subtitle="환자별 보험 활성 상태와 변경 이력을 확인하기 위한 초안입니다."
      tags={["보험", "보험이력", "활성여부", "증권가입번호"]}
      kpis={[
        { label: "활성 보험", value: "128" },
        { label: "만료 예정", value: "17" },
        { label: "금일 변경", value: "9" },
      ]}
      sections={[
        {
          title: "보험",
          description: "환자별 보험 기본정보",
          columns: ["보험아이디", "환자번호", "보험종류", "보험기간", "활성여부"],
          rows: [
            ["INS-501", "P-000433", "국민건강보험", "2025-01-01 ~ 2026-12-31", "Y"],
            ["INS-502", "P-000121", "실손", "2024-06-01 ~ 2026-05-31", "Y"],
            ["INS-503", "P-000991", "자동차보험", "2025-07-15 ~ 2025-08-15", "N"],
          ],
        },
        {
          title: "보험이력",
          description: "변경유형과 변경 전/후 스냅샷 관리",
          columns: ["보험이력ID", "보험아이디", "변경유형", "변경일", "처리자"],
          rows: [
            ["IH-1001", "INS-501", "갱신", "2026-01-02 09:11", "박원무"],
            ["IH-1002", "INS-502", "보장항목수정", "2026-02-10 15:23", "김원무"],
            ["IH-1003", "INS-503", "해지", "2026-02-11 13:47", "이원무"],
          ],
        },
      ]}
    />
  );
}
