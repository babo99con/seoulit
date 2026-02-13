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
    SELECT 'ACTIVE' AS code, '재직' AS label, 1 AS sort_order FROM dual
    UNION ALL SELECT 'ON_LEAVE', '휴직', 2 FROM dual
    UNION ALL SELECT 'RESIGNED', '퇴사', 3 FROM dual
) s
ON (t.CODE = s.CODE)
WHEN MATCHED THEN
  UPDATE SET
    t.LABEL = s.LABEL,
    t.SORT_ORDER = s.SORT_ORDER,
    t.IS_ACTIVE = 'Y',
    t.UPDATED_AT = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (CODE, LABEL, SORT_ORDER, IS_ACTIVE, CREATED_AT, UPDATED_AT)
  VALUES (s.CODE, s.LABEL, s.SORT_ORDER, 'Y', SYSDATE, SYSDATE);

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
    t.PASSWORD_HASH = s.password_hash,
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
