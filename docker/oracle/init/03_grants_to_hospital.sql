DECLARE
    v_cnt NUMBER;

    PROCEDURE grant_if_table_exists(p_owner IN VARCHAR2, p_table IN VARCHAR2) IS
        v_tbl_cnt NUMBER;
    BEGIN
        SELECT COUNT(*)
          INTO v_tbl_cnt
          FROM ALL_TABLES
         WHERE OWNER = UPPER(p_owner)
           AND TABLE_NAME = UPPER(p_table);

        IF v_tbl_cnt > 0 THEN
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

        IF v_seq_cnt > 0 THEN
            EXECUTE IMMEDIATE 'GRANT SELECT ON ' || p_owner || '.' || p_seq || ' TO HOSPITAL';
        END IF;
    END;
BEGIN
    SELECT COUNT(*) INTO v_cnt FROM ALL_USERS WHERE USERNAME = 'HOSPITAL';
    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE 'CREATE USER HOSPITAL IDENTIFIED BY "1111"';
        EXECUTE IMMEDIATE 'GRANT CREATE SESSION TO HOSPITAL';
        EXECUTE IMMEDIATE 'ALTER USER HOSPITAL QUOTA UNLIMITED ON USERS';
    END IF;

    grant_if_table_exists('CMH', 'DEPARTMENTS');
    grant_if_table_exists('CMH', 'POSITIONS');
    grant_if_table_exists('CMH', 'STAFF_STATUS_CODES');
    grant_if_table_exists('CMH', 'STAFF');
    grant_if_table_exists('CMH', 'STAFF_CREDENTIAL');

    grant_if_table_exists('LHS', 'MENU');

    grant_if_sequence_exists('CMH', 'DEPT_SEQ');
    grant_if_sequence_exists('CMH', 'POSITION_SEQ');
    grant_if_sequence_exists('CMH', 'STAFF_SEQ');
    grant_if_sequence_exists('CMH', 'STAFF_CREDENTIAL_SEQ');
END;
/
