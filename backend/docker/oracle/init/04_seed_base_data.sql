DECLARE
    v_cnt NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_cnt
    FROM ALL_TAB_COLUMNS
    WHERE OWNER = 'CMH' AND TABLE_NAME = 'STAFF' AND COLUMN_NAME = 'PASSWORD_HASH';

    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE CMH.STAFF ADD (PASSWORD_HASH VARCHAR2(64))';
    END IF;
END;
/

MERGE INTO CMH.STAFF_STATUS_CODES t
USING (
    SELECT 'ACTIVE' AS code, '재직' AS label, 1 AS sort_order, 'Y' AS is_active FROM dual
    UNION ALL SELECT 'ON_LEAVE', '휴직', 2, 'Y' FROM dual
    UNION ALL SELECT 'RESIGNED', '퇴사', 3, 'Y' FROM dual
    UNION ALL SELECT 'SUSPENDED', '정지', 4, 'Y' FROM dual
    UNION ALL SELECT 'PENDING_APPROVAL', '승인대기', 90, 'N' FROM dual
    UNION ALL SELECT 'REJECTED_SIGNUP', '가입반려', 91, 'N' FROM dual
) s
ON (t.CODE = s.CODE)
WHEN MATCHED THEN
  UPDATE SET
    t.LABEL = s.LABEL,
    t.SORT_ORDER = s.SORT_ORDER,
    t.IS_ACTIVE = s.is_active,
    t.UPDATED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (CODE, LABEL, SORT_ORDER, IS_ACTIVE, CREATED_AT, UPDATED_AT)
  VALUES (s.CODE, s.LABEL, s.SORT_ORDER, s.is_active, SYSDATE, SYSDATE);

COMMIT;

MERGE INTO CMH.STAFF_COMMON_DOC t
USING (
    SELECT 1201 AS id, '규정' AS category, '환자 개인정보 처리 지침' AS title,
           '외부 반출 금지, 접근 권한 최소화 원칙을 준수합니다.' AS content,
           'v2.1' AS version_label,
           '총무팀' AS owner_name,
           NULL AS sender_dept_id,
           '공통' AS sender_dept_name,
           NULL AS receiver_dept_id,
           '전체' AS receiver_dept_name,
           'admin' AS approver_id,
           '시스템 관리자' AS approver_name,
           'APPROVED' AS approval_status,
           NULL AS rejection_reason,
           'admin' AS author_id,
           '시스템 관리자' AS author_name,
           'N' AS is_deleted
      FROM dual
    UNION ALL
    SELECT 1202, '매뉴얼', '응급실 초진 프로토콜',
           '중증도 분류 후 5분 내 의사 호출, 표준 기록 양식을 사용합니다.',
           'v1.4',
           '응급의학과',
           NULL,
           '응급의학과',
           NULL,
           '응급의학과',
           'admin',
           '시스템 관리자',
           'PENDING',
           NULL,
           'admin',
           '시스템 관리자',
           'N'
      FROM dual
    UNION ALL
    SELECT 1203, '양식', '진료기록 정정 요청서',
           '정정 사유, 정정 전/후 내용을 기재하여 제출합니다.',
           'v1.0',
           '원무팀',
           NULL,
           '원무팀',
           NULL,
           '원무팀',
           'admin',
           '시스템 관리자',
           'REJECTED',
           '양식 항목 누락',
           'admin',
           '시스템 관리자',
           'N'
      FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.CATEGORY = s.category,
    t.TITLE = s.title,
    t.CONTENT = s.content,
    t.VERSION_LABEL = s.version_label,
    t.OWNER_NAME = s.owner_name,
    t.SENDER_DEPT_ID = s.sender_dept_id,
    t.SENDER_DEPT_NAME = s.sender_dept_name,
    t.RECEIVER_DEPT_ID = s.receiver_dept_id,
    t.RECEIVER_DEPT_NAME = s.receiver_dept_name,
    t.APPROVER_ID = s.approver_id,
    t.APPROVER_NAME = s.approver_name,
    t.APPROVAL_STATUS = s.approval_status,
    t.REJECTION_REASON = s.rejection_reason,
    t.AUTHOR_ID = s.author_id,
    t.AUTHOR_NAME = s.author_name,
    t.IS_DELETED = s.is_deleted,
    t.UPDATED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (ID, CATEGORY, TITLE, CONTENT, VERSION_LABEL, OWNER_NAME, SENDER_DEPT_ID, SENDER_DEPT_NAME, RECEIVER_DEPT_ID, RECEIVER_DEPT_NAME, APPROVER_ID, APPROVER_NAME, APPROVAL_STATUS, REJECTION_REASON, AUTHOR_ID, AUTHOR_NAME, IS_DELETED, CREATED_AT, UPDATED_AT)
  VALUES (s.id, s.category, s.title, s.content, s.version_label, s.owner_name, s.sender_dept_id, s.sender_dept_name, s.receiver_dept_id, s.receiver_dept_name, s.approver_id, s.approver_name, s.approval_status, s.rejection_reason, s.author_id, s.author_name, s.is_deleted, SYSDATE, SYSDATE);

COMMIT;

MERGE INTO CMH.STAFF_BOARD_POST t
USING (
    SELECT 1001 AS id, 'NOTICE' AS category, '필독' AS post_type,
           '개인정보보호 교육 일정 안내' AS title,
           'TYPE:공지\n전 직원 대상 개인정보보호 교육이 진행됩니다.' AS content,
           '2026-03-05' AS event_date,
           NULL AS location,
           NULL AS subject_name,
           NULL AS department_name,
           'admin' AS author_id,
           '시스템 관리자' AS author_name,
           '1234' AS delete_pin,
           'N' AS is_deleted
      FROM dual
    UNION ALL
    SELECT 1002, 'SCHEDULE', '공지',
           '주간 운영회의',
           '각 부서 주간 이슈를 공유합니다.',
           '월 09:00',
           '본관 3층 회의실',
           NULL,
           NULL,
           'admin',
           '시스템 관리자',
           '1234',
           'N'
      FROM dual
    UNION ALL
    SELECT 1003, 'EVENT', '공지',
           '[경사] 박OO 결혼',
           'TYPE:경사\n\n예식장: 전주 더메이웨딩 3층\n일시: 2026-03-12 13:00',
           '2026-03-12',
           NULL,
           '박OO 결혼',
           '원무팀',
           'admin',
           '시스템 관리자',
           '1234',
           'N'
      FROM dual
    UNION ALL SELECT 1004, 'EVENT', '일반', '[부고] 전북대학교 통계학과 김광수 교수 부친상', 'TYPE:조사\n\n빈소: 전북대병원 장례식장 2호실\n발인: 2026-03-13', '2026-03-11', NULL, '전북대학교 통계학과 김광수 교수 부친상', '행정팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1005, 'EVENT', '일반', '[경사] 이OO 결혼', 'TYPE:경사\n\n예식장: 라한호텔 1층\n일시: 2026-03-15 12:30', '2026-03-15', NULL, '이OO 결혼', '간호부', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1006, 'EVENT', '공지', '[경사] 최OO 자녀 돌잔치', 'TYPE:경사\n\n장소: 더컨벤션 2층\n일시: 2026-03-16 18:00', '2026-03-16', NULL, '최OO 자녀 돌잔치', '진료지원팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1007, 'EVENT', '일반', '[부고] 김OO 모친상', 'TYPE:조사\n\n빈소: 전주예수병원 장례식장 5호실\n발인: 2026-03-17', '2026-03-15', NULL, '김OO 모친상', '원무팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1008, 'EVENT', '일반', '[경사] 정OO 결혼', 'TYPE:경사\n\n예식장: 그랜드힐스 4층\n일시: 2026-03-20 11:00', '2026-03-20', NULL, '정OO 결혼', '영상의학과', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1009, 'EVENT', '일반', '[경사] 박OO 결혼', 'TYPE:경사\n\n예식장: 더채플 6층\n일시: 2026-03-21 14:00', '2026-03-21', NULL, '박OO 결혼', '원무팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1010, 'EVENT', '공지', '[부고] 송OO 부친상', 'TYPE:조사\n\n빈소: 남원의료원 장례식장 특실\n발인: 2026-03-22', '2026-03-20', NULL, '송OO 부친상', '시설관리팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1011, 'EVENT', '일반', '[경사] 장OO 결혼', 'TYPE:경사\n\n예식장: 더메종 2층\n일시: 2026-03-23 13:00', '2026-03-23', NULL, '장OO 결혼', '검사실', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1012, 'EVENT', '일반', '[부고] 조OO 모친상', 'TYPE:조사\n\n빈소: 군산의료원 장례식장 3호실\n발인: 2026-03-24', '2026-03-22', NULL, '조OO 모친상', '간호부', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1013, 'EVENT', '일반', '[경사] 윤OO 결혼', 'TYPE:경사\n\n예식장: 노블레스웨딩 5층\n일시: 2026-03-26 12:00', '2026-03-26', NULL, '윤OO 결혼', '약제팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1014, 'EVENT', '공지', '[경사] 임OO 자녀 돌잔치', 'TYPE:경사\n\n장소: 더파티 3층\n일시: 2026-03-27 17:30', '2026-03-27', NULL, '임OO 자녀 돌잔치', '원무팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1015, 'EVENT', '일반', '[부고] 한OO 부친상', 'TYPE:조사\n\n빈소: 익산병원 장례식장 1호실\n발인: 2026-03-28', '2026-03-26', NULL, '한OO 부친상', '행정팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1016, 'EVENT', '일반', '[경사] 오OO 결혼', 'TYPE:경사\n\n예식장: 아르떼웨딩 2층\n일시: 2026-03-29 11:30', '2026-03-29', NULL, '오OO 결혼', '재활치료실', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1017, 'EVENT', '일반', '[경사] 배OO 결혼', 'TYPE:경사\n\n예식장: 벨라루체 7층\n일시: 2026-03-30 14:30', '2026-03-30', NULL, '배OO 결혼', '원무팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1018, 'EVENT', '공지', '[부고] 문OO 모친상', 'TYPE:조사\n\n빈소: 전주효자장례식장 6호실\n발인: 2026-03-31', '2026-03-29', NULL, '문OO 모친상', '간호부', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1019, 'EVENT', '일반', '[경사] 고OO 결혼', 'TYPE:경사\n\n예식장: 더시티웨딩 4층\n일시: 2026-04-01 13:30', '2026-04-01', NULL, '고OO 결혼', '영상의학과', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1020, 'EVENT', '일반', '[부고] 백OO 부친상', 'TYPE:조사\n\n빈소: 정읍아산병원 장례식장 2호실\n발인: 2026-04-02', '2026-03-31', NULL, '백OO 부친상', '원무팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1021, 'EVENT', '일반', '[경사] 신OO 결혼', 'TYPE:경사\n\n예식장: 웨딩스퀘어 1층\n일시: 2026-04-03 12:00', '2026-04-03', NULL, '신OO 결혼', '검사실', 'admin', '시스템 관리자', '1234', 'N' FROM dual
    UNION ALL SELECT 1022, 'EVENT', '공지', '[경사] 황OO 자녀 돌잔치', 'TYPE:경사\n\n장소: 한옥마을 컨벤션\n일시: 2026-04-04 18:00', '2026-04-04', NULL, '황OO 자녀 돌잔치', '행정팀', 'admin', '시스템 관리자', '1234', 'N' FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.CATEGORY = s.category,
    t.POST_TYPE = s.post_type,
    t.TITLE = s.title,
    t.CONTENT = s.content,
    t.EVENT_DATE = s.event_date,
    t.LOCATION = s.location,
    t.SUBJECT_NAME = s.subject_name,
    t.DEPARTMENT_NAME = s.department_name,
    t.AUTHOR_ID = s.author_id,
    t.AUTHOR_NAME = s.author_name,
    t.DELETE_PIN = s.delete_pin,
    t.IS_DELETED = s.is_deleted,
    t.UPDATED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (ID, CATEGORY, POST_TYPE, TITLE, CONTENT, EVENT_DATE, LOCATION, SUBJECT_NAME, DEPARTMENT_NAME, AUTHOR_ID, AUTHOR_NAME, DELETE_PIN, IS_DELETED, CREATED_AT, UPDATED_AT)
  VALUES (s.id, s.category, s.post_type, s.title, s.content, s.event_date, s.location, s.subject_name, s.department_name, s.author_id, s.author_name, s.delete_pin, s.is_deleted, SYSDATE, SYSDATE);

COMMIT;

MERGE INTO CMH.VISIT_REG t
USING (
    SELECT 1 AS id, 'V20260213-000001' AS visit_no, 1 AS patient_id, 'P000001' AS patient_no, '홍길동' AS patient_name,
           '010-1234-5678' AS patient_phone, 'OUTPATIENT' AS visit_type, 'WAITING' AS status,
           '내과' AS dept_code, '김의사' AS doctor_id, 0 AS priority_yn FROM dual
    UNION ALL
    SELECT 2, 'V20260213-000002', 2, 'P000002', '김영희', '010-2222-3333', 'RESERVATION', 'WAITING', '외과', '이의사', 0 FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.VISIT_NO = s.visit_no,
    t.PATIENT_ID = s.patient_id,
    t.PATIENT_NO = s.patient_no,
    t.PATIENT_NAME = s.patient_name,
    t.PATIENT_PHONE = s.patient_phone,
    t.VISIT_TYPE = s.visit_type,
    t.STATUS = s.status,
    t.DEPT_CODE = s.dept_code,
    t.DOCTOR_ID = s.doctor_id,
    t.PRIORITY_YN = s.priority_yn,
    t.UPDATED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (ID, VISIT_NO, PATIENT_ID, PATIENT_NO, PATIENT_NAME, PATIENT_PHONE, VISIT_TYPE, STATUS, DEPT_CODE, DOCTOR_ID, PRIORITY_YN, CREATED_BY, UPDATED_BY, CREATED_AT, UPDATED_AT)
  VALUES (s.id, s.visit_no, s.patient_id, s.patient_no, s.patient_name, s.patient_phone, s.visit_type, s.status, s.dept_code, s.doctor_id, s.priority_yn, 'seed', 'seed', SYSDATE, SYSDATE);

MERGE INTO CMH.VISIT_RESERVATION t
USING (
    SELECT 2 AS visit_id, 'R-20260213-01' AS reservation_id FROM dual
) s
ON (t.VISIT_ID = s.visit_id)
WHEN MATCHED THEN
  UPDATE SET
    t.RESERVATION_ID = s.reservation_id,
    t.SCHEDULED_AT = SYSDATE + (1/24),
    t.ARRIVAL_AT = SYSDATE,
    t.NOTE = '사전 예약 환자',
    t.UPDATED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (VISIT_ID, RESERVATION_ID, SCHEDULED_AT, ARRIVAL_AT, NOTE, UPDATED_AT)
  VALUES (s.visit_id, s.reservation_id, SYSDATE + (1/24), SYSDATE, '사전 예약 환자', SYSDATE);

MERGE INTO CMH.VISIT_HISTORY t
USING (
    SELECT 1 AS id, 1 AS visit_id, 'CREATE' AS event_type, 'status' AS field_name, NULL AS old_value, 'WAITING' AS new_value, 'seed' AS reason, 'seed' AS changed_by FROM dual
    UNION ALL
    SELECT 2, 2, 'CREATE', 'status', NULL, 'WAITING', 'seed', 'seed' FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.VISIT_ID = s.visit_id,
    t.EVENT_TYPE = s.event_type,
    t.FIELD_NAME = s.field_name,
    t.OLD_VALUE = s.old_value,
    t.NEW_VALUE = s.new_value,
    t.REASON = s.reason,
    t.CHANGED_BY = s.changed_by,
    t.CHANGED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (ID, VISIT_ID, EVENT_TYPE, FIELD_NAME, OLD_VALUE, NEW_VALUE, REASON, CHANGED_BY, CHANGED_AT)
  VALUES (s.id, s.visit_id, s.event_type, s.field_name, s.old_value, s.new_value, s.reason, s.changed_by, SYSDATE);

COMMIT;

MERGE INTO LHS.MENU t
USING (
    SELECT 1 AS id, NULL AS parent_id, 'RECEPTION' AS code, '원무' AS name, '/reception' AS path, 'DashboardOutlined' AS icon, 1 AS sort_order, 1 AS is_active FROM dual
    UNION ALL SELECT 2, NULL, 'PATIENT', '환자', '/patients', 'PersonSearchOutlined', 2, 1 FROM dual
    UNION ALL SELECT 3, NULL, 'DOCTOR', '진료', '/doctor', 'LocalHospitalOutlined', 3, 1 FROM dual
    UNION ALL SELECT 4, NULL, 'STAFF', '스탭', '/staff', 'BadgeOutlined', 4, 1 FROM dual
    UNION ALL SELECT 5, NULL, 'ADMIN', '관리', '/admin', 'AdminPanelSettingsOutlined', 5, 1 FROM dual
    UNION ALL SELECT 6, 1, 'RECEPTION_RESERVATION', '예약 접수', '/reception/reservations', 'EventAvailableOutlined', 10, 1 FROM dual
    UNION ALL SELECT 7, 1, 'RECEPTION_EMERGENCY', '응급 접수', '/reception/emergency', 'LocalHospitalOutlined', 11, 1 FROM dual
    UNION ALL SELECT 8, 1, 'RECEPTION_INPATIENT', '입원 접수', '/reception/inpatient', 'HotelOutlined', 12, 1 FROM dual
    UNION ALL SELECT 9, 1, 'RECEPTION_HISTORY', '접수 이력', '/reception/history', 'HistoryOutlined', 13, 1 FROM dual
    UNION ALL SELECT 10, 3, 'DOCTOR_ENCOUNTERS', '진료 목록', '/doctor/encounters', 'AssignmentOutlined', 10, 1 FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.PARENT_ID = s.parent_id,
    t.CODE = s.code,
    t.NAME = s.name,
    t.PATH = s.path,
    t.ICON = s.icon,
    t.SORT_ORDER = s.sort_order,
    t.IS_ACTIVE = s.is_active,
    t.UPDATED_AT = SYSTIMESTAMP
WHEN NOT MATCHED THEN
  INSERT (ID, PARENT_ID, CODE, NAME, PATH, ICON, SORT_ORDER, IS_ACTIVE, CREATED_AT, UPDATED_AT)
  VALUES (s.id, s.parent_id, s.code, s.name, s.path, s.icon, s.sort_order, s.is_active, SYSTIMESTAMP, SYSTIMESTAMP);

COMMIT;

DELETE FROM LHS.MENU WHERE CODE = 'DOCTOR_INACTIVE';
COMMIT;

MERGE INTO CMH.MEDICAL_ENCOUNTER t
USING (
    SELECT 1000 AS id, 1 AS visit_id, 1 AS patient_id, 'P000001' AS patient_no, '홍길동' AS patient_name,
           'doctor' AS doctor_id, '내과' AS dept_code, 'WAITING' AS status,
           '기침 및 발열 2일' AS chief_complaint, '상기도감염 의심' AS assessment,
           '해열제 처방 및 수분 섭취 권고' AS plan_note, 'J06.9' AS diagnosis_code,
           '초진 진료' AS memo, 'Y' AS is_active FROM dual
    UNION ALL
    SELECT 1001, 2, 2, 'P000002', '김영희', 'doctor', '외과', 'IN_PROGRESS',
           '우측 어깨 통증', '회전근개 염증 가능성',
           'X-ray 후 물리치료 권고', 'M75.1',
           '재진 환자', 'Y' FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.VISIT_ID = s.visit_id,
    t.PATIENT_ID = s.patient_id,
    t.PATIENT_NO = s.patient_no,
    t.PATIENT_NAME = s.patient_name,
    t.DOCTOR_ID = s.doctor_id,
    t.DEPT_CODE = s.dept_code,
    t.STATUS = s.status,
    t.CHIEF_COMPLAINT = s.chief_complaint,
    t.ASSESSMENT = s.assessment,
    t.PLAN_NOTE = s.plan_note,
    t.DIAGNOSIS_CODE = s.diagnosis_code,
    t.MEMO = s.memo,
    t.IS_ACTIVE = s.is_active,
    t.UPDATED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (ID, VISIT_ID, PATIENT_ID, PATIENT_NO, PATIENT_NAME, DOCTOR_ID, DEPT_CODE, STATUS, CHIEF_COMPLAINT, ASSESSMENT, PLAN_NOTE, DIAGNOSIS_CODE, MEMO, IS_ACTIVE, CREATED_BY, UPDATED_BY, CREATED_AT, UPDATED_AT)
  VALUES (s.id, s.visit_id, s.patient_id, s.patient_no, s.patient_name, s.doctor_id, s.dept_code, s.status, s.chief_complaint, s.assessment, s.plan_note, s.diagnosis_code, s.memo, s.is_active, 'seed', 'seed', SYSDATE, SYSDATE);

MERGE INTO CMH.MEDICAL_ENCOUNTER_HISTORY t
USING (
    SELECT 1000 AS id, 1000 AS encounter_id, 'CREATE' AS event_type, 'status' AS field_name, NULL AS old_value, 'WAITING' AS new_value, 'seed' AS reason, 'seed' AS changed_by FROM dual
    UNION ALL
    SELECT 1001, 1001, 'CREATE', 'status', NULL, 'IN_PROGRESS', 'seed', 'seed' FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.ENCOUNTER_ID = s.encounter_id,
    t.EVENT_TYPE = s.event_type,
    t.FIELD_NAME = s.field_name,
    t.OLD_VALUE = s.old_value,
    t.NEW_VALUE = s.new_value,
    t.REASON = s.reason,
    t.CHANGED_BY = s.changed_by,
    t.CHANGED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (ID, ENCOUNTER_ID, EVENT_TYPE, FIELD_NAME, OLD_VALUE, NEW_VALUE, REASON, CHANGED_BY, CHANGED_AT)
  VALUES (s.id, s.encounter_id, s.event_type, s.field_name, s.old_value, s.new_value, s.reason, s.changed_by, SYSDATE);

COMMIT;

MERGE INTO CMH.DEPARTMENTS t
USING (
    SELECT 1 AS id, '원무팀' AS name, '접수 및 수납' AS description, '1층' AS location FROM dual
    UNION ALL SELECT 2, '진료부', '외래 진료 운영', '2층' FROM dual
    UNION ALL SELECT 3, '간호부', '병동 및 외래 간호', '3층' FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.NAME = s.name,
    t.DESCRIPTION = s.description,
    t.LOCATION = s.location,
    t.IS_ACTIVE = 'Y',
    t.SORT_ORDER = s.id,
    t.UPDATED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (ID, NAME, DESCRIPTION, LOCATION, IS_ACTIVE, SORT_ORDER, CREATED_AT, UPDATED_AT)
  VALUES (s.id, s.name, s.description, s.location, 'Y', s.id, SYSDATE, SYSDATE);

MERGE INTO CMH.POSITIONS t
USING (
    SELECT 1 AS id, 'ADMIN' AS domain, '관리자' AS title FROM dual
    UNION ALL SELECT 2, 'DOCTOR', '의사' FROM dual
    UNION ALL SELECT 3, 'NURSE', '간호사' FROM dual
    UNION ALL SELECT 4, 'RECEPTION', '원무' FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.DOMAIN = s.domain,
    t.TITLE = s.title,
    t.IS_ACTIVE = 'Y',
    t.SORT_ORDER = s.id,
    t.UPDATED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (ID, DOMAIN, TITLE, IS_ACTIVE, SORT_ORDER, CREATED_AT, UPDATED_AT)
  VALUES (s.id, s.domain, s.title, 'Y', s.id, SYSDATE, SYSDATE);

MERGE INTO CMH.STAFF t
USING (
    SELECT 1 AS id, 'admin' AS username, 'ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270' AS password_hash,
           'ADMIN' AS domain_role, '시스템 관리자' AS full_name, 1 AS dept_id, 1 AS position_id FROM dual
    UNION ALL
    SELECT 2, 'doctor', 'd2274d8036d76d502a1b1e5527f42938ca6ff04a0b0fba6fdc2fde5581dfba88', 'DOCTOR', '진료의 김담당', 2, 2 FROM dual
    UNION ALL
    SELECT 3, 'nurse', '4a5d8f8b5df78fd21a54a808eef159c215f0a6522ceae90afbbd63f3d542c978', 'NURSE', '간호사 이담당', 3, 3 FROM dual
    UNION ALL
    SELECT 4, 'reception', '56bc378a62ab65a28a62cf09740a74394b72c9ab000c5fdef7aef38eb8f4a590', 'RECEPTION', '원무 박담당', 1, 4 FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.USERNAME = s.username,
    t.PASSWORD_HASH = CASE WHEN t.ID = 1 THEN t.PASSWORD_HASH ELSE s.password_hash END,
    t.STATUS = 'ACTIVE',
    t.STATUS_CODE = 'ACTIVE',
    t.DOMAIN_ROLE = s.domain_role,
    t.FULL_NAME = s.full_name,
    t.DEPT_ID = s.dept_id,
    t.POSITION_ID = s.position_id,
    t.UPDATED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (ID, USERNAME, PASSWORD_HASH, STATUS, STATUS_CODE, DOMAIN_ROLE, FULL_NAME, DEPT_ID, POSITION_ID, CREATED_AT, UPDATED_AT)
  VALUES (s.id, s.username, s.password_hash, 'ACTIVE', 'ACTIVE', s.domain_role, s.full_name, s.dept_id, s.position_id, SYSDATE, SYSDATE);

COMMIT;
