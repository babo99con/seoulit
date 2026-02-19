package app.staff.dto;

import lombok.Data;

@Data
public class StaffAssignmentUpdateReq {
    private Long deptId;
    private Long positionId;
    private String reason;
}
