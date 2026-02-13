package app.staff.dto;

import lombok.Data;

@Data
public class StaffDto {

    private Long id;
    private String username;
    private String email;
    private String status;
    private String domainRole;
    private String fullName;
    private String officeLocation;
    private String phone;
    private String bio;
}
