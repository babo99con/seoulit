-- Sample data for CMH.STAFF_CREDENTIAL (Oracle)
-- Safe to run multiple times: inserts are guarded by NOT EXISTS.

-- Staff #1: ACTIVE license + ACTIVE certificate
INSERT INTO CMH.STAFF_CREDENTIAL (
    ID,
    STAFF_ID,
    CRED_TYPE,
    NAME,
    CRED_NUMBER,
    ISSUER,
    ISSUED_AT,
    EXPIRES_AT,
    STATUS,
    EVIDENCE_KEY,
    CREATED_AT,
    UPDATED_AT
)
SELECT
    NULL,
    s.ID,
    'LICENSE',
    '의사 면허',
    'LIC-1001',
    '보건복지부',
    ADD_MONTHS(TRUNC(SYSDATE), -24),
    ADD_MONTHS(TRUNC(SYSDATE), 8),
    'ACTIVE',
    NULL,
    SYSDATE,
    SYSDATE
FROM (SELECT ID FROM CMH.STAFF WHERE ROWNUM = 1) s
WHERE NOT EXISTS (
    SELECT 1
    FROM CMH.STAFF_CREDENTIAL c
    WHERE c.STAFF_ID = s.ID
      AND c.CRED_TYPE = 'LICENSE'
      AND c.CRED_NUMBER = 'LIC-1001'
);

INSERT INTO CMH.STAFF_CREDENTIAL (
    ID,
    STAFF_ID,
    CRED_TYPE,
    NAME,
    CRED_NUMBER,
    ISSUER,
    ISSUED_AT,
    EXPIRES_AT,
    STATUS,
    EVIDENCE_KEY,
    CREATED_AT,
    UPDATED_AT
)
SELECT
    NULL,
    s.ID,
    'CERT',
    '심폐소생술 자격증',
    'CERT-1001',
    '대한심폐소생협회',
    ADD_MONTHS(TRUNC(SYSDATE), -12),
    ADD_MONTHS(TRUNC(SYSDATE), 2),
    'ACTIVE',
    NULL,
    SYSDATE,
    SYSDATE
FROM (SELECT ID FROM CMH.STAFF WHERE ROWNUM = 1) s
WHERE NOT EXISTS (
    SELECT 1
    FROM CMH.STAFF_CREDENTIAL c
    WHERE c.STAFF_ID = s.ID
      AND c.CRED_TYPE = 'CERT'
      AND c.CRED_NUMBER = 'CERT-1001'
);

-- Staff #2: EXPIRED license + REVOKED certificate
INSERT INTO CMH.STAFF_CREDENTIAL (
    ID,
    STAFF_ID,
    CRED_TYPE,
    NAME,
    CRED_NUMBER,
    ISSUER,
    ISSUED_AT,
    EXPIRES_AT,
    STATUS,
    EVIDENCE_KEY,
    CREATED_AT,
    UPDATED_AT
)
SELECT
    NULL,
    s.ID,
    'LICENSE',
    '간호사 면허',
    'LIC-2001',
    '보건복지부',
    ADD_MONTHS(TRUNC(SYSDATE), -60),
    ADD_MONTHS(TRUNC(SYSDATE), -6),
    'EXPIRED',
    NULL,
    SYSDATE,
    SYSDATE
FROM (
    SELECT ID
    FROM (
        SELECT ID, ROW_NUMBER() OVER (ORDER BY ID) AS RN
        FROM CMH.STAFF
    )
    WHERE RN = 2
) s
WHERE NOT EXISTS (
    SELECT 1
    FROM CMH.STAFF_CREDENTIAL c
    WHERE c.STAFF_ID = s.ID
      AND c.CRED_TYPE = 'LICENSE'
      AND c.CRED_NUMBER = 'LIC-2001'
);

INSERT INTO CMH.STAFF_CREDENTIAL (
    ID,
    STAFF_ID,
    CRED_TYPE,
    NAME,
    CRED_NUMBER,
    ISSUER,
    ISSUED_AT,
    EXPIRES_AT,
    STATUS,
    EVIDENCE_KEY,
    CREATED_AT,
    UPDATED_AT
)
SELECT
    NULL,
    s.ID,
    'CERT',
    '수술실 감염관리 자격증',
    'CERT-2001',
    '대한감염관리학회',
    ADD_MONTHS(TRUNC(SYSDATE), -36),
    ADD_MONTHS(TRUNC(SYSDATE), 12),
    'REVOKED',
    NULL,
    SYSDATE,
    SYSDATE
FROM (
    SELECT ID
    FROM (
        SELECT ID, ROW_NUMBER() OVER (ORDER BY ID) AS RN
        FROM CMH.STAFF
    )
    WHERE RN = 2
) s
WHERE NOT EXISTS (
    SELECT 1
    FROM CMH.STAFF_CREDENTIAL c
    WHERE c.STAFF_ID = s.ID
      AND c.CRED_TYPE = 'CERT'
      AND c.CRED_NUMBER = 'CERT-2001'
);

-- Staff #3: expiring soon ACTIVE cert (for notification UI)
INSERT INTO CMH.STAFF_CREDENTIAL (
    ID,
    STAFF_ID,
    CRED_TYPE,
    NAME,
    CRED_NUMBER,
    ISSUER,
    ISSUED_AT,
    EXPIRES_AT,
    STATUS,
    EVIDENCE_KEY,
    CREATED_AT,
    UPDATED_AT
)
SELECT
    NULL,
    s.ID,
    'CERT',
    '중환자실 전문자격증',
    'CERT-3001',
    '대한중환자의학회',
    ADD_MONTHS(TRUNC(SYSDATE), -24),
    TRUNC(SYSDATE) + 10,
    'ACTIVE',
    NULL,
    SYSDATE,
    SYSDATE
FROM (
    SELECT ID
    FROM (
        SELECT ID, ROW_NUMBER() OVER (ORDER BY ID) AS RN
        FROM CMH.STAFF
    )
    WHERE RN = 3
) s
WHERE NOT EXISTS (
    SELECT 1
    FROM CMH.STAFF_CREDENTIAL c
    WHERE c.STAFF_ID = s.ID
      AND c.CRED_TYPE = 'CERT'
      AND c.CRED_NUMBER = 'CERT-3001'
);

COMMIT;
