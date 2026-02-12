"use client";

import DomainDraftPage from "@/components/scaffold/DomainDraftPage";

export default function CareFlowPage() {
  return (
    <DomainDraftPage
      title="예약 / 접수 / 진료 흐름"
      subtitle="환자 기준 예약-접수-진료 전이를 확인하는 기본 화면입니다."
      tags={["예약", "접수", "진료", "상태전이"]}
      kpis={[
        { label: "오늘 예약", value: "132" },
        { label: "오늘 접수", value: "96" },
        { label: "진료 진행", value: "41" },
      ]}
      sections={[
        {
          title: "예약",
          description: "담당의/예약경로/상태코드 관리",
          columns: ["예약ID", "환자번호", "담당의사", "예약일시", "예약상태"],
          rows: [
            ["A-1021", "P-000433", "이진료", "2026-02-12 09:30", "CONFIRMED"],
            ["A-1022", "P-000121", "박정형", "2026-02-12 10:00", "WAITING"],
            ["A-1023", "P-000732", "김내과", "2026-02-12 10:20", "CANCELED"],
          ],
        },
        {
          title: "접수",
          description: "워크인 포함 접수 상태",
          columns: ["접수ID", "환자번호", "예약ID", "접수유형", "접수상태"],
          rows: [
            ["R-8101", "P-000433", "A-1021", "예약", "WAITING"],
            ["R-8102", "P-000612", "-", "워크인", "CALLED"],
            ["R-8103", "P-000121", "A-1022", "예약", "CHECKED_IN"],
          ],
        },
        {
          title: "진료",
          description: "접수 기준 진료 생성/완료 관리",
          columns: ["진료ID", "접수ID", "담당의사", "진료시작", "진료상태"],
          rows: [
            ["V-5501", "R-8101", "이진료", "2026-02-12 09:41", "IN_PROGRESS"],
            ["V-5502", "R-8102", "김내과", "2026-02-12 09:55", "COMPLETED"],
            ["V-5503", "R-8091", "박정형", "2026-02-12 09:12", "COMPLETED"],
          ],
        },
      ]}
    />
  );
}
