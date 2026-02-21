package app.shift.service;

import app.shift.dto.ShiftAssignReq;
import app.shift.dto.ShiftAssignmentRes;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Service
public class ShiftQueryServiceImpl implements ShiftQueryService {

    private final JdbcTemplate jdbc;

    public ShiftQueryServiceImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<ShiftAssignmentRes> list(String fromDate, String toDate) {
        String from = StringUtils.hasText(fromDate) ? fromDate.trim() : "0000-01-01";
        String to = StringUtils.hasText(toDate) ? toDate.trim() : "9999-12-31";
        return jdbc.query(
                "SELECT ID, SHIFT_DATE, STAFF_ID, STAFF_NAME, DEPARTMENT_NAME, SHIFT_TYPE, CREATED_BY, TO_CHAR(CREATED_AT,'YYYY-MM-DD HH24:MI') CREATED_AT FROM CMH.SHIFT_ASSIGNMENT WHERE SHIFT_DATE BETWEEN ? AND ? ORDER BY SHIFT_DATE, ID",
                ps -> {
                    ps.setString(1, from);
                    ps.setString(2, to);
                },
                (rs, i) -> map(rs)
        );
    }

    @Override
    @Transactional
    public ShiftAssignmentRes create(String username, ShiftAssignReq req) {
        if (req == null || !StringUtils.hasText(req.shiftDate) || !StringUtils.hasText(req.staffId) || !StringUtils.hasText(req.shiftType)) {
            throw new IllegalArgumentException("필수 값이 누락되었습니다.");
        }
        Integer dup = jdbc.queryForObject(
                "SELECT COUNT(*) FROM CMH.SHIFT_ASSIGNMENT WHERE SHIFT_DATE=? AND STAFF_ID=? AND SHIFT_TYPE=?",
                Integer.class,
                req.shiftDate.trim(), req.staffId.trim(), req.shiftType.trim()
        );
        if (dup != null && dup > 0) {
            throw new IllegalArgumentException("같은 날짜/직원/근무타입 배정이 이미 있습니다.");
        }

        Long id = jdbc.queryForObject("SELECT CMH.SHIFT_ASSIGNMENT_SEQ.NEXTVAL FROM DUAL", Long.class);
        jdbc.update(
                "INSERT INTO CMH.SHIFT_ASSIGNMENT (ID, SHIFT_DATE, STAFF_ID, STAFF_NAME, DEPARTMENT_NAME, SHIFT_TYPE, CREATED_BY, CREATED_AT, UPDATED_AT) VALUES (?,?,?,?,?,?,?,SYSDATE,SYSDATE)",
                id,
                req.shiftDate.trim(),
                req.staffId.trim(),
                req.staffName == null ? req.staffId.trim() : req.staffName.trim(),
                req.departmentName == null ? null : req.departmentName.trim(),
                req.shiftType.trim(),
                username == null ? "" : username.trim()
        );

        return jdbc.query(
                "SELECT ID, SHIFT_DATE, STAFF_ID, STAFF_NAME, DEPARTMENT_NAME, SHIFT_TYPE, CREATED_BY, TO_CHAR(CREATED_AT,'YYYY-MM-DD HH24:MI') CREATED_AT FROM CMH.SHIFT_ASSIGNMENT WHERE ID=?",
                ps -> ps.setLong(1, id),
                rs -> rs.next() ? map(rs) : null
        );
    }

    private ShiftAssignmentRes map(ResultSet rs) throws SQLException {
        ShiftAssignmentRes r = new ShiftAssignmentRes();
        r.id = rs.getLong("ID");
        r.shiftDate = rs.getString("SHIFT_DATE");
        r.staffId = rs.getString("STAFF_ID");
        r.staffName = rs.getString("STAFF_NAME");
        r.departmentName = rs.getString("DEPARTMENT_NAME");
        r.shiftType = rs.getString("SHIFT_TYPE");
        r.createdBy = rs.getString("CREATED_BY");
        r.createdAt = rs.getString("CREATED_AT");
        return r;
    }
}
