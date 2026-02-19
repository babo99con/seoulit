package app.staff.dto;

import lombok.Data;

@Data
public class StaffChangeRequestCreateReq {
    private Integer staffId;
    private String requestType;
    private String reason;
    private String payload;
}
