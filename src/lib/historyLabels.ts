const EVENT_LABEL_MAP: Record<string, string> = {
  ASSIGNMENT_CHANGE: "부서/직책 변경",
  STATUS_CHANGE: "재직 상태 변경",
  PASSWORD_CHANGE: "비밀번호 변경",
  CREATE: "등록",
  UPDATE: "수정",
  DELETE: "삭제",
  DEACTIVATE: "비활성 처리",
  ACTIVATE: "활성 처리",
};

export const toHistoryEventLabel = (eventType?: string | null) => {
  const raw = (eventType ?? "").trim();
  if (!raw) return "-";
  const mapped = EVENT_LABEL_MAP[raw.toUpperCase()];
  return mapped ?? raw;
};
