package app.staff.dto;

import lombok.Data;

@Data
public class StaffStatusUpdateReq {
    private String statusCode;
    private String reason;
}
