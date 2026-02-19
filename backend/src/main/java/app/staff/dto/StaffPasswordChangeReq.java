package app.staff.dto;

import lombok.Data;

@Data
public class StaffPasswordChangeReq {
    private String currentPassword;
    private String newPassword;
}
