"use client";

import DomainDraftPage from "@/components/scaffold/DomainDraftPage";

export default function StaffOrganizationPage() {
  return (
    <DomainDraftPage
      title="사용자 / 조직 / 의료진"
      subtitle="역할, 사용자, 부서, 직종/직책, 의료진(의사/간호사) 구조 초안입니다."
      tags={["역할", "사용자", "부서", "의료진", "의사", "간호사"]}
      kpis={[
        { label: "활성 사용자", value: "94" },
        { label: "부서", value: "17" },
        { label: "의료진", value: "58" },
      ]}
      sections={[
        {
          title: "역할 / 사용자",
          description: "역할코드와 사용자 계정 권한 연결",
          columns: ["아이디", "이름", "역할코드", "역할명", "사용여부"],
          rows: [
            ["dr.lee", "이진료", "DOCTOR", "의사", "Y"],
            ["ns.kim", "김간호", "NURSE", "간호사", "Y"],
            ["rc.park", "박원무", "RECEPTION", "원무", "Y"],
          ],
        },
        {
          title: "부서 / 직종 / 직책",
          description: "조직 트리와 직종/직책 체계",
          columns: ["부서코드", "부서명", "직종", "직책", "대표전화"],
          rows: [
            ["DEP-OPD", "외래", "DOCTOR", "진료과장", "02-3010-1200"],
            ["DEP-NUR", "간호부", "NURSE", "수간호사", "02-3010-2200"],
            ["DEP-ADM", "원무과", "ADMIN", "팀장", "02-3010-3200"],
          ],
        },
        {
          title: "의료진 상세",
          description: "의사/간호사 면허 및 상태 관리",
          columns: ["의료진ID", "구분", "면허번호", "전문과목", "상태코드"],
          rows: [
            ["M-1001", "의사", "DR-2024-0001", "피부과", "ON_DUTY"],
            ["M-2004", "간호사", "RN-2021-0911", "-", "ON_DUTY"],
            ["M-2012", "간호사", "RN-2020-0532", "-", "BREAK"],
          ],
        },
      ]}
    />
  );
}
