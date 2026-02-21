package app.leave.service;

import app.leave.dto.ApprovedLeaveRes;
import app.leave.dto.LeaveDecisionReq;
import app.leave.dto.LeaveRequestCreateReq;
import app.leave.dto.LeaveRequestRes;

import java.util.List;

public interface LeaveQueryService {
    List<LeaveRequestRes> search(String username, String tab);
    LeaveRequestRes create(String username, LeaveRequestCreateReq req);
    LeaveRequestRes decide(String username, Long requestId, LeaveDecisionReq req);
    List<ApprovedLeaveRes> approvedLeaves();
}
