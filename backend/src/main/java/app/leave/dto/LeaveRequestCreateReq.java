package app.leave.dto;

import java.util.List;

public class LeaveRequestCreateReq {
    public String leaveType;
    public String fromDate;
    public String toDate;
    public String reason;
    public List<String> approverIds;
    public List<String> ccIds;
}
