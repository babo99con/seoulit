package app.staff.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StaffCommonDocLineRes {
    private Long id;
    private int lineOrder;
    private String lineType;
    private String approverId;
    private String approverName;
    private String actionStatus;
    private String actionComment;
    private String actedAt;
}
