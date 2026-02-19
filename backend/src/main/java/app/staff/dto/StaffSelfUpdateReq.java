package app.staff.dto;

import lombok.Data;

@Data
public class StaffSelfUpdateReq {
    private String fullName;
    private String phone;
    private String officeLocation;
    private String bio;
}
