package app.staff.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class DepartmentListItem {
    private Long id;
    private String name;
    private String buildingNo;
    private String floorNo;
    private String roomNo;
    private String extension;
    private String isActive;
    private Integer sortOrder;
    private Date createdAt;
    private Date updatedAt;
    private Long staffCount;
}

