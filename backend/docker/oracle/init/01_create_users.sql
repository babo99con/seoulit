DECLARE
    PROCEDURE create_user_if_missing(p_username IN VARCHAR2, p_password IN VARCHAR2) IS
        v_cnt NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_cnt FROM ALL_USERS WHERE USERNAME = UPPER(p_username);
        IF v_cnt = 0 THEN
            EXECUTE IMMEDIATE 'CREATE USER ' || p_username || ' IDENTIFIED BY "' || p_password || '"';
        END IF;

        EXECUTE IMMEDIATE 'GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE SEQUENCE, CREATE TRIGGER TO ' || p_username;
        EXECUTE IMMEDIATE 'ALTER USER ' || p_username || ' QUOTA UNLIMITED ON USERS';
    END;
BEGIN
    create_user_if_missing('CMH', '1111');
    create_user_if_missing('LHS', '1111');
END;
/
