package app.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffChangeRequestRes {
    private Long id;
    private Integer staffId;
    private String requestType;
    private String reason;
    private String status;
    private String requestedBy;
    private Date requestedAt;
    private String reviewedBy;
    private Date reviewedAt;
    private String reviewComment;
    private String payload;
}
