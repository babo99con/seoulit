package app.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffAuditLogRes {
    private Long id;
    private String actionType;
    private String targetType;
    private String targetId;
    private String actor;
    private String actorRole;
    private String reason;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String userAgent;
    private Date createdAt;
}
