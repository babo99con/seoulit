package app.staff.dto;

import lombok.Data;

@Data
public class DepartmentsDto {

    private Long id;
    private String name;
    private String description;
    private String location;
    private Long headStaffId;
}

