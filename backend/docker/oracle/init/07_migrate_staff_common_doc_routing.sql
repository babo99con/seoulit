DECLARE
    PROCEDURE add_column_if_missing(
        p_owner       IN VARCHAR2,
        p_table_name  IN VARCHAR2,
        p_column_name IN VARCHAR2,
        p_column_def  IN VARCHAR2
    ) IS
        v_cnt NUMBER;
    BEGIN
        SELECT COUNT(*)
          INTO v_cnt
          FROM ALL_TAB_COLUMNS
         WHERE OWNER = UPPER(p_owner)
           AND TABLE_NAME = UPPER(p_table_name)
           AND COLUMN_NAME = UPPER(p_column_name);

        IF v_cnt = 0 THEN
            EXECUTE IMMEDIATE 'ALTER TABLE ' || p_owner || '.' || p_table_name || ' ADD (' || p_column_name || ' ' || p_column_def || ')';
        END IF;
    END;

    PROCEDURE add_constraint_if_missing(
        p_owner          IN VARCHAR2,
        p_table_name     IN VARCHAR2,
        p_constraint_name IN VARCHAR2,
        p_constraint_ddl IN CLOB
    ) IS
        v_cnt NUMBER;
    BEGIN
        SELECT COUNT(*)
          INTO v_cnt
          FROM ALL_CONSTRAINTS
         WHERE OWNER = UPPER(p_owner)
           AND TABLE_NAME = UPPER(p_table_name)
           AND CONSTRAINT_NAME = UPPER(p_constraint_name);

        IF v_cnt = 0 THEN
            EXECUTE IMMEDIATE p_constraint_ddl;
        END IF;
    END;
BEGIN
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'SENDER_DEPT_ID', 'NUMBER');
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'SENDER_DEPT_NAME', 'VARCHAR2(100)');
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'RECEIVER_DEPT_ID', 'NUMBER');
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'RECEIVER_DEPT_NAME', 'VARCHAR2(100)');
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'APPROVER_ID', 'VARCHAR2(100)');
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'APPROVER_NAME', 'VARCHAR2(100)');
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'APPROVAL_STATUS', 'VARCHAR2(20)');
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'REJECTION_REASON', 'VARCHAR2(500)');
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'ATTACH_FILE_NAME', 'VARCHAR2(200)');
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'ATTACH_MIME_TYPE', 'VARCHAR2(100)');
    add_column_if_missing('CMH', 'STAFF_COMMON_DOC', 'ATTACH_BASE64', 'CLOB');

    add_constraint_if_missing(
        'CMH',
        'STAFF_COMMON_DOC',
        'CK_STF_DOC_APPR_STATUS',
        'ALTER TABLE CMH.STAFF_COMMON_DOC ADD CONSTRAINT CK_STF_DOC_APPR_STATUS CHECK (APPROVAL_STATUS IN (''PENDING'',''APPROVED'',''REJECTED''))'
    );
END;
/

DECLARE
    v_cnt NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_cnt FROM ALL_TABLES WHERE OWNER='CMH' AND TABLE_NAME='STAFF_COMMON_DOC_LINE';
    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE 'CREATE TABLE CMH.STAFF_COMMON_DOC_LINE (
            ID NUMBER NOT NULL,
            DOC_ID NUMBER NOT NULL,
            LINE_ORDER NUMBER NOT NULL,
            LINE_TYPE VARCHAR2(20) NOT NULL,
            APPROVER_ID VARCHAR2(100) NOT NULL,
            APPROVER_NAME VARCHAR2(100) NOT NULL,
            ACTION_STATUS VARCHAR2(20) NOT NULL,
            ACTION_COMMENT VARCHAR2(500),
            ACTED_AT DATE,
            CREATED_AT DATE NOT NULL
        )';
    END IF;

    SELECT COUNT(*) INTO v_cnt FROM ALL_CONSTRAINTS WHERE OWNER='CMH' AND TABLE_NAME='STAFF_COMMON_DOC_LINE' AND CONSTRAINT_NAME='PK_STAFF_COMMON_DOC_LINE';
    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE CMH.STAFF_COMMON_DOC_LINE ADD CONSTRAINT PK_STAFF_COMMON_DOC_LINE PRIMARY KEY (ID)';
    END IF;

    SELECT COUNT(*) INTO v_cnt FROM ALL_CONSTRAINTS WHERE OWNER='CMH' AND TABLE_NAME='STAFF_COMMON_DOC_LINE' AND CONSTRAINT_NAME='FK_STF_DOC_LINE_DOC';
    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE CMH.STAFF_COMMON_DOC_LINE ADD CONSTRAINT FK_STF_DOC_LINE_DOC FOREIGN KEY (DOC_ID) REFERENCES CMH.STAFF_COMMON_DOC(ID)';
    END IF;

    SELECT COUNT(*) INTO v_cnt FROM ALL_CONSTRAINTS WHERE OWNER='CMH' AND TABLE_NAME='STAFF_COMMON_DOC_LINE' AND CONSTRAINT_NAME='CK_STF_DOC_LINE_TYPE';
    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE q'[ALTER TABLE CMH.STAFF_COMMON_DOC_LINE ADD CONSTRAINT CK_STF_DOC_LINE_TYPE CHECK (LINE_TYPE IN ('APPROVAL','CC'))]';
    END IF;

    SELECT COUNT(*) INTO v_cnt FROM ALL_CONSTRAINTS WHERE OWNER='CMH' AND TABLE_NAME='STAFF_COMMON_DOC_LINE' AND CONSTRAINT_NAME='CK_STF_DOC_LINE_STATUS';
    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE q'[ALTER TABLE CMH.STAFF_COMMON_DOC_LINE ADD CONSTRAINT CK_STF_DOC_LINE_STATUS CHECK (ACTION_STATUS IN ('PENDING','APPROVED','REJECTED','READ'))]';
    END IF;

    SELECT COUNT(*) INTO v_cnt FROM ALL_SEQUENCES WHERE SEQUENCE_OWNER='CMH' AND SEQUENCE_NAME='STAFF_COMMON_DOC_LINE_SEQ';
    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE 'CREATE SEQUENCE CMH.STAFF_COMMON_DOC_LINE_SEQ START WITH 1000 INCREMENT BY 1 NOCACHE';
    END IF;
END;
/

MERGE INTO CMH.STAFF_COMMON_DOC t
USING (
    SELECT 1201 AS id,
           10 AS sender_dept_id,
           '총무팀' AS sender_dept_name,
           20 AS receiver_dept_id,
           '전체' AS receiver_dept_name,
           'A100' AS approver_id,
           '시스템 관리자' AS approver_name,
           'APPROVED' AS approval_status,
           NULL AS rejection_reason
      FROM dual
    UNION ALL
    SELECT 1202,
           30,
           '응급의학과',
           31,
           '응급의학과',
           'A200',
           '응급의학과장',
           'PENDING',
           NULL
      FROM dual
    UNION ALL
    SELECT 1203,
           40,
           '원무팀',
           41,
           '원무팀',
           'A300',
           '원무팀장',
           'REJECTED',
           '양식 항목 누락'
      FROM dual
) s
ON (t.ID = s.id)
WHEN MATCHED THEN
  UPDATE SET
    t.SENDER_DEPT_ID = s.sender_dept_id,
    t.SENDER_DEPT_NAME = s.sender_dept_name,
    t.RECEIVER_DEPT_ID = s.receiver_dept_id,
    t.RECEIVER_DEPT_NAME = s.receiver_dept_name,
    t.APPROVER_ID = s.approver_id,
    t.APPROVER_NAME = s.approver_name,
    t.APPROVAL_STATUS = s.approval_status,
    t.REJECTION_REASON = s.rejection_reason,
    t.UPDATED_AT = SYSDATE;

COMMIT;

SELECT ID,
       TITLE,
       RECEIVER_DEPT_NAME,
       APPROVAL_STATUS
  FROM CMH.STAFF_COMMON_DOC
 WHERE ID BETWEEN 1201 AND 1203
 ORDER BY ID;
