package app.leave.service;

import app.leave.dto.ApprovedLeaveRes;
import app.leave.dto.LeaveDecisionReq;
import app.leave.dto.LeaveLineDto;
import app.leave.dto.LeaveRequestCreateReq;
import app.leave.dto.LeaveRequestRes;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LeaveQueryServiceImpl implements LeaveQueryService {

    private final JdbcTemplate jdbc;
    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm", Locale.KOREA);

    public LeaveQueryServiceImpl(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static class LineRow {
        long requestId;
        LeaveLineDto line;
    }

    @Override
    public List<LeaveRequestRes> search(String username, String tab) {
        String user = trim(username);
        List<LeaveRequestRes> reqs = jdbc.query(
                "SELECT ID, REQUESTER_ID, REQUESTER_NAME, DEPARTMENT_NAME, LEAVE_TYPE, FROM_DATE, TO_DATE, REASON, FINAL_STATUS, TO_CHAR(CREATED_AT,'YYYY-MM-DD HH24:MI') CREATED_AT FROM CMH.LEAVE_REQUEST ORDER BY ID DESC",
                (rs, i) -> mapReq(rs)
        );
        if (reqs.isEmpty()) return List.of();

        String inClause = reqs.stream().map(r -> String.valueOf(r.id)).collect(Collectors.joining(","));
        List<LineRow> lineRows = jdbc.query(
                "SELECT REQUEST_ID, ID, LINE_TYPE, APPROVER_ID, APPROVER_NAME, LINE_ORDER, ACTION_STATUS, ACTED_AT FROM CMH.LEAVE_APPROVAL_LINE WHERE REQUEST_ID IN (" + inClause + ") ORDER BY REQUEST_ID, LINE_ORDER",
                (rs, i) -> mapLineRow(rs)
        );
        Map<Long, List<LeaveLineDto>> linesByReq = lineRows.stream().collect(Collectors.groupingBy(l -> l.requestId, Collectors.mapping(l -> l.line, Collectors.toList())));
        reqs.forEach(r -> r.lines = linesByReq.getOrDefault(r.id, List.of()));

        return reqs.stream().filter(r -> canView(r, user)).filter(r -> filterTab(r, user, tab)).toList();
    }

    @Override
    @Transactional
    public LeaveRequestRes create(String username, LeaveRequestCreateReq req) {
        if (req == null || !StringUtils.hasText(req.leaveType) || !StringUtils.hasText(req.fromDate) || !StringUtils.hasText(req.toDate)) {
            throw new IllegalArgumentException("필수 값이 누락되었습니다.");
        }
        if (req.approverIds == null || req.approverIds.isEmpty()) {
            throw new IllegalArgumentException("결재선을 1명 이상 지정해 주세요.");
        }

        String user = trim(username);
        String requesterName = jdbc.query(
                "SELECT NVL(FULL_NAME, USERNAME) FROM CMH.STAFF WHERE NLSSORT(TRIM(USERNAME), 'NLS_SORT=BINARY_CI') = NLSSORT(TRIM(?), 'NLS_SORT=BINARY_CI')",
                ps -> ps.setString(1, user),
                rs -> rs.next() ? rs.getString(1) : user
        );
        String dept = jdbc.query(
                "SELECT d.NAME FROM CMH.STAFF s LEFT JOIN CMH.DEPARTMENTS d ON d.ID = s.DEPT_ID WHERE NLSSORT(TRIM(s.USERNAME), 'NLS_SORT=BINARY_CI') = NLSSORT(TRIM(?), 'NLS_SORT=BINARY_CI')",
                ps -> ps.setString(1, user),
                rs -> rs.next() ? rs.getString(1) : null
        );

        Long requestId = jdbc.queryForObject("SELECT CMH.LEAVE_REQUEST_SEQ.NEXTVAL FROM DUAL", Long.class);
        jdbc.update("INSERT INTO CMH.LEAVE_REQUEST (ID, REQUESTER_ID, REQUESTER_NAME, DEPARTMENT_NAME, LEAVE_TYPE, FROM_DATE, TO_DATE, REASON, FINAL_STATUS, CREATED_AT, UPDATED_AT) VALUES (?,?,?,?,?,?,?,?, 'PENDING', SYSDATE, SYSDATE)",
                requestId, user, requesterName, dept, trim(req.leaveType), trim(req.fromDate), trim(req.toDate), trim(req.reason));

        int order = 1;
        for (String approverId : req.approverIds) {
            String id = trim(approverId);
            if (id.isEmpty()) continue;
            insertLine(requestId, "APPROVAL", id, order++);
        }
        int ccOrder = 1;
        if (req.ccIds != null) {
            for (String cc : req.ccIds) {
                String id = trim(cc);
                if (id.isEmpty()) continue;
                boolean dup = req.approverIds.stream().anyMatch(a -> trim(a).equals(id));
                if (dup) continue;
                insertLine(requestId, "CC", id, ccOrder++);
            }
        }

        return findOne(requestId);
    }

    @Override
    @Transactional
    public LeaveRequestRes decide(String username, Long requestId, LeaveDecisionReq req) {
        if (req == null || req.lineId == null || !StringUtils.hasText(req.action)) {
            throw new IllegalArgumentException("결재 요청 값이 올바르지 않습니다.");
        }
        String user = trim(username);
        Integer can = jdbc.queryForObject(
                "SELECT COUNT(*) FROM CMH.LEAVE_APPROVAL_LINE WHERE ID=? AND REQUEST_ID=? AND APPROVER_ID=? AND LINE_TYPE='APPROVAL' AND ACTION_STATUS='PENDING'",
                Integer.class,
                req.lineId, requestId, user
        );
        if (can == null || can == 0) throw new IllegalArgumentException("처리 가능한 결재 라인이 아닙니다.");

        String action = trim(req.action).toUpperCase(Locale.ROOT);
        String next = ("REJECT".equals(action) || "REJECTED".equals(action)) ? "REJECTED" : "APPROVED";
        jdbc.update("UPDATE CMH.LEAVE_APPROVAL_LINE SET ACTION_STATUS=?, ACTED_AT=?, UPDATED_AT=SYSDATE WHERE ID=?", next, DT.format(LocalDateTime.now()), req.lineId);

        Integer rejected = jdbc.queryForObject("SELECT COUNT(*) FROM CMH.LEAVE_APPROVAL_LINE WHERE REQUEST_ID=? AND LINE_TYPE='APPROVAL' AND ACTION_STATUS='REJECTED'", Integer.class, requestId);
        Integer pending = jdbc.queryForObject("SELECT COUNT(*) FROM CMH.LEAVE_APPROVAL_LINE WHERE REQUEST_ID=? AND LINE_TYPE='APPROVAL' AND ACTION_STATUS='PENDING'", Integer.class, requestId);
        String finalStatus = (rejected != null && rejected > 0) ? "REJECTED" : ((pending != null && pending == 0) ? "APPROVED_FINAL" : "PENDING");
        jdbc.update("UPDATE CMH.LEAVE_REQUEST SET FINAL_STATUS=?, UPDATED_AT=SYSDATE WHERE ID=?", finalStatus, requestId);

        return findOne(requestId);
    }

    @Override
    public List<ApprovedLeaveRes> approvedLeaves() {
        return jdbc.query(
                "SELECT REQUESTER_ID, REQUESTER_NAME, FROM_DATE, TO_DATE, LEAVE_TYPE FROM CMH.LEAVE_REQUEST WHERE FINAL_STATUS='APPROVED_FINAL'",
                (rs, i) -> {
                    ApprovedLeaveRes r = new ApprovedLeaveRes();
                    r.requesterId = rs.getString("REQUESTER_ID");
                    r.requesterName = rs.getString("REQUESTER_NAME");
                    r.fromDate = rs.getString("FROM_DATE");
                    r.toDate = rs.getString("TO_DATE");
                    r.leaveType = rs.getString("LEAVE_TYPE");
                    return r;
                }
        );
    }

    private LeaveRequestRes findOne(Long requestId) {
        LeaveRequestRes req = jdbc.query(
                "SELECT ID, REQUESTER_ID, REQUESTER_NAME, DEPARTMENT_NAME, LEAVE_TYPE, FROM_DATE, TO_DATE, REASON, FINAL_STATUS, TO_CHAR(CREATED_AT,'YYYY-MM-DD HH24:MI') CREATED_AT FROM CMH.LEAVE_REQUEST WHERE ID=?",
                ps -> ps.setLong(1, requestId),
                rs -> rs.next() ? mapReq(rs) : null
        );
        if (req == null) throw new IllegalArgumentException("휴가 문서를 찾을 수 없습니다.");
        req.lines = jdbc.query(
                "SELECT ID, LINE_TYPE, APPROVER_ID, APPROVER_NAME, LINE_ORDER, ACTION_STATUS, ACTED_AT FROM CMH.LEAVE_APPROVAL_LINE WHERE REQUEST_ID=? ORDER BY LINE_ORDER",
                ps -> ps.setLong(1, requestId),
                (rs, i) -> mapLine(rs)
        );
        return req;
    }

    private void insertLine(Long requestId, String lineType, String approverId, int order) {
        Long lineId = jdbc.queryForObject("SELECT CMH.LEAVE_APPROVAL_LINE_SEQ.NEXTVAL FROM DUAL", Long.class);
        String approverName = jdbc.query(
                "SELECT NVL(FULL_NAME, USERNAME) FROM CMH.STAFF WHERE NLSSORT(TRIM(USERNAME), 'NLS_SORT=BINARY_CI') = NLSSORT(TRIM(?), 'NLS_SORT=BINARY_CI')",
                ps -> ps.setString(1, approverId),
                rs -> rs.next() ? rs.getString(1) : approverId
        );
        jdbc.update("INSERT INTO CMH.LEAVE_APPROVAL_LINE (ID, REQUEST_ID, LINE_TYPE, APPROVER_ID, APPROVER_NAME, LINE_ORDER, ACTION_STATUS, CREATED_AT, UPDATED_AT) VALUES (?,?,?,?,?,?, 'PENDING', SYSDATE, SYSDATE)",
                lineId, requestId, lineType, approverId, approverName, order);
    }

    private LeaveRequestRes mapReq(ResultSet rs) throws SQLException {
        LeaveRequestRes r = new LeaveRequestRes();
        r.id = rs.getLong("ID");
        r.requesterId = rs.getString("REQUESTER_ID");
        r.requesterName = rs.getString("REQUESTER_NAME");
        r.department = rs.getString("DEPARTMENT_NAME");
        r.leaveType = rs.getString("LEAVE_TYPE");
        r.fromDate = rs.getString("FROM_DATE");
        r.toDate = rs.getString("TO_DATE");
        r.reason = rs.getString("REASON");
        r.finalStatus = rs.getString("FINAL_STATUS");
        r.createdAt = rs.getString("CREATED_AT");
        r.lines = new ArrayList<>();
        return r;
    }

    private LineRow mapLineRow(ResultSet rs) throws SQLException {
        LineRow row = new LineRow();
        row.requestId = rs.getLong("REQUEST_ID");
        row.line = mapLine(rs);
        return row;
    }

    private LeaveLineDto mapLine(ResultSet rs) throws SQLException {
        LeaveLineDto l = new LeaveLineDto();
        l.id = rs.getLong("ID");
        l.lineType = rs.getString("LINE_TYPE");
        l.approverId = rs.getString("APPROVER_ID");
        l.approverName = rs.getString("APPROVER_NAME");
        l.lineOrder = rs.getInt("LINE_ORDER");
        l.status = rs.getString("ACTION_STATUS");
        l.actedAt = rs.getString("ACTED_AT");
        return l;
    }

    private boolean canView(LeaveRequestRes req, String username) {
        if (username.equals(req.requesterId)) return true;
        return req.lines.stream().anyMatch(l -> username.equals(l.approverId));
    }

    private boolean filterTab(LeaveRequestRes req, String username, String tab) {
        String t = trim(tab).toLowerCase(Locale.ROOT);
        if ("mine".equals(t)) return username.equals(req.requesterId);
        if ("approval".equals(t)) return req.lines.stream().anyMatch(l -> username.equals(l.approverId));
        return req.lines.stream().anyMatch(l -> username.equals(l.approverId) && "APPROVAL".equals(l.lineType) && "PENDING".equals(l.status));
    }

    private String trim(String v) {
        return v == null ? "" : v.trim();
    }
}
