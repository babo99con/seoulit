package app.leave.dto;

import java.util.List;

public class LeaveRequestRes {
    public Long id;
    public String requesterId;
    public String requesterName;
    public String department;
    public String leaveType;
    public String fromDate;
    public String toDate;
    public String reason;
    public String finalStatus;
    public String createdAt;
    public List<LeaveLineDto> lines;
}
