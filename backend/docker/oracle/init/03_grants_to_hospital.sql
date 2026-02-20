DECLARE
    v_cnt NUMBER;
    v_menu_cnt NUMBER;

    PROCEDURE grant_if_table_exists(p_owner IN VARCHAR2, p_table IN VARCHAR2) IS
        v_tbl_cnt NUMBER;
    BEGIN
        SELECT COUNT(*)
          INTO v_tbl_cnt
          FROM ALL_TABLES
         WHERE OWNER = UPPER(p_owner)
           AND TABLE_NAME = UPPER(p_table);

        IF v_tbl_cnt > 0 AND v_cnt > 0 THEN
            EXECUTE IMMEDIATE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ' || p_owner || '.' || p_table || ' TO HOSPITAL';
        END IF;
    END;

    PROCEDURE grant_if_sequence_exists(p_owner IN VARCHAR2, p_seq IN VARCHAR2) IS
        v_seq_cnt NUMBER;
    BEGIN
        SELECT COUNT(*)
          INTO v_seq_cnt
          FROM ALL_SEQUENCES
         WHERE SEQUENCE_OWNER = UPPER(p_owner)
           AND SEQUENCE_NAME = UPPER(p_seq);

        IF v_seq_cnt > 0 AND v_cnt > 0 THEN
            EXECUTE IMMEDIATE 'GRANT SELECT ON ' || p_owner || '.' || p_seq || ' TO HOSPITAL';
        END IF;
    END;
BEGIN
    SELECT COUNT(*) INTO v_cnt FROM ALL_USERS WHERE USERNAME = 'HOSPITAL';

    grant_if_table_exists('CMH', 'DEPARTMENTS');
    grant_if_table_exists('CMH', 'POSITIONS');
    grant_if_table_exists('CMH', 'STAFF_STATUS_CODES');
    grant_if_table_exists('CMH', 'STAFF');
    grant_if_table_exists('CMH', 'STAFF_CREDENTIAL');
    grant_if_table_exists('CMH', 'STAFF_HISTORY');
    grant_if_table_exists('CMH', 'STAFF_CHANGE_REQUEST');
    grant_if_table_exists('CMH', 'STAFF_AUDIT_LOG');
    grant_if_table_exists('CMH', 'STAFF_BOARD_POST');
    grant_if_table_exists('CMH', 'VISIT_REG');
    grant_if_table_exists('CMH', 'VISIT_HISTORY');
    grant_if_table_exists('CMH', 'VISIT_RESERVATION');
    grant_if_table_exists('CMH', 'VISIT_EMERGENCY');
    grant_if_table_exists('CMH', 'VISIT_INPATIENT');
    grant_if_table_exists('CMH', 'MEDICAL_ENCOUNTER');
    grant_if_table_exists('CMH', 'MEDICAL_ENCOUNTER_HISTORY');
    grant_if_table_exists('CMH', 'MEDICAL_ENCOUNTER_DIAGNOSIS');
    grant_if_table_exists('CMH', 'MEDICAL_ENCOUNTER_ASSET');

    grant_if_table_exists('LHS', 'MENU');

    SELECT COUNT(*) INTO v_menu_cnt FROM ALL_TABLES WHERE OWNER='LHS' AND TABLE_NAME='MENU';
    IF v_menu_cnt > 0 THEN
        EXECUTE IMMEDIATE 'GRANT SELECT ON LHS.MENU TO CMH';
    END IF;

    grant_if_sequence_exists('CMH', 'DEPT_SEQ');
    grant_if_sequence_exists('CMH', 'POSITION_SEQ');
    grant_if_sequence_exists('CMH', 'STAFF_SEQ');
    grant_if_sequence_exists('CMH', 'STAFF_CREDENTIAL_SEQ');
    grant_if_sequence_exists('CMH', 'STAFF_HISTORY_SEQ');
    grant_if_sequence_exists('CMH', 'STAFF_CHANGE_REQ_SEQ');
    grant_if_sequence_exists('CMH', 'STAFF_AUDIT_LOG_SEQ');
    grant_if_sequence_exists('CMH', 'STAFF_BOARD_POST_SEQ');
    grant_if_sequence_exists('CMH', 'VISIT_REG_SEQ');
    grant_if_sequence_exists('CMH', 'VISIT_HISTORY_SEQ');
    grant_if_sequence_exists('CMH', 'MEDICAL_ENCOUNTER_SEQ');
    grant_if_sequence_exists('CMH', 'MEDICAL_ENCOUNTER_HIS_SEQ');
    grant_if_sequence_exists('CMH', 'MEDICAL_ENC_DIAG_SEQ');
    grant_if_sequence_exists('CMH', 'MEDICAL_ENC_ASSET_SEQ');
END;
/
