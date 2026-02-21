package app.shift.service;

import app.shift.dto.ShiftAssignReq;
import app.shift.dto.ShiftAssignmentRes;

import java.util.List;

public interface ShiftQueryService {
    List<ShiftAssignmentRes> list(String fromDate, String toDate);
    ShiftAssignmentRes create(String username, ShiftAssignReq req);
}
