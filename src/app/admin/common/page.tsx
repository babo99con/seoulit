"use client";

import DomainDraftPage from "@/components/scaffold/DomainDraftPage";

export default function AdminCommonPage() {
  return (
    <DomainDraftPage
      title="공통 기준정보"
      subtitle="코드그룹/코드상세, 메뉴, 채번관리와 외부 코드 연계 후보를 함께 보는 초안입니다."
      tags={["코드그룹", "코드상세", "메뉴", "채번관리", "외부코드연계"]}
      kpis={[
        { label: "코드그룹", value: "18" },
        { label: "상세코드", value: "236" },
        { label: "메뉴", value: "42" },
      ]}
      sections={[
        {
          title: "코드그룹",
          description: "업무 공통코드의 그룹 마스터",
          columns: ["그룹코드", "그룹이름", "수정여부", "활성여부", "수정일"],
          rows: [
            ["VISIT_STATUS", "진료상태", "Y", "Y", "2026-02-11"],
            ["PAY_METHOD", "결제수단", "N", "Y", "2026-02-10"],
            ["INS_REVIEW", "보험심사상태", "Y", "Y", "2026-02-09"],
          ],
        },
        {
          title: "메뉴",
          description: "사이드바/권한 연계 메뉴 관리",
          columns: ["메뉴아이디", "상위메뉴", "메뉴코드", "메뉴명", "사용여부"],
          rows: [
            ["100", "-", "RECEPTION", "원무", "Y"],
            ["210", "200", "PATIENT_MEMO", "환자 메모", "Y"],
            ["340", "300", "BILLING_LIST", "청구 목록", "Y"],
          ],
        },
        {
          title: "채번관리",
          description: "일자별 채번 시퀀스 현황",
          columns: ["채번일자", "채번유형", "최종번호"],
          rows: [
            ["2026-02-12", "PATIENT_NO", "182"],
            ["2026-02-12", "RECEPTION_NO", "421"],
            ["2026-02-12", "ORDER_NO", "775"],
          ],
        },
        {
          title: "외부 연계 후보(요약)",
          description: "공공데이터/국제코드 기반으로 우선 검토 가능한 데이터셋",
          columns: ["분야", "데이터", "활용 대상 컬럼", "비고"],
          rows: [
            [
              "진단코드",
              "WHO ICD API",
              "진단.진단코드 / 진단.진단명",
              "https://icd.who.int/icdapi",
            ],
            [
              "질병 통계",
              "주부상병(3단/4단) 건강보험 진료 통계",
              "코드그룹(DIAG_KCD) 사전 정합성 검토",
              "HIRA 공공데이터 목록에서 신청",
            ],
            [
              "의약품",
              "의약품 사용 통계 / 성분 사용실적",
              "처방상세.약품코드 / 약품명",
              "HIRA 공공데이터 목록에서 신청",
            ],
            [
              "진료행위",
              "진료행위(검사/수술 등) 통계",
              "오더상세.항목코드 / 항목명",
              "HIRA 공공데이터 목록에서 신청",
            ],
          ],
        },
      ]}
    />
  );
}
