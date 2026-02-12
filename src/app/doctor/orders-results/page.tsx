"use client";

import DomainDraftPage from "@/components/scaffold/DomainDraftPage";

export default function OrdersResultsPage() {
  return (
    <DomainDraftPage
      title="오더 / 결과"
      subtitle="오더-오더상세-결과(검사/영상/처치/투약) 연결 구조를 위한 초안입니다."
      tags={["오더", "오더상세", "검사시행", "영상결과", "처치결과", "투약이력"]}
      kpis={[
        { label: "오더", value: "187" },
        { label: "결과완료", value: "124" },
        { label: "진행중", value: "26" },
      ]}
      sections={[
        {
          title: "오더",
          description: "진료ID 기준 오더 생성 현황",
          columns: ["오더ID", "진료ID", "오더유형", "요청의사", "상태"],
          rows: [
            ["O-8801", "V-5501", "LAB", "이진료", "IN_PROGRESS"],
            ["O-8802", "V-5501", "IMAGING", "이진료", "COMPLETED"],
            ["O-8803", "V-5502", "TREATMENT", "김내과", "COMPLETED"],
          ],
        },
        {
          title: "오더상세",
          description: "항목코드/수량/지시사항",
          columns: ["오더상세ID", "오더ID", "항목명", "수량", "상태"],
          rows: [
            ["OD-4411", "O-8801", "CBC", "1", "IN_PROGRESS"],
            ["OD-4412", "O-8802", "흉부 X-ray", "1", "COMPLETED"],
            ["OD-4413", "O-8803", "네뷸라이저", "1", "COMPLETED"],
          ],
        },
        {
          title: "결과",
          description: "검사/영상/처치/투약 결과 요약",
          columns: ["결과구분", "오더상세ID", "시행/판독자", "요약", "상태"],
          rows: [
            ["검사시행", "OD-4411", "진단검사의학과", "WBC 경미 상승", "COMPLETED"],
            ["영상결과", "OD-4412", "박영상", "특이 소견 없음", "COMPLETED"],
            ["투약이력", "OD-4413", "김간호", "흡입제 투약 완료", "COMPLETED"],
          ],
        },
      ]}
    />
  );
}
