package app.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StaffListItem {

    private Integer id;
    private String username;
    private String statusCode;
    private String status;
    private String domainRole;
    private String fullName;
    private String officeLocation;
    private String photoKey;
    private String bio;
    private String phone;
    private Long deptId;
    private Long positionId;
    private String departmentName;
    private String positionName;
    private String photoUrl;
}

