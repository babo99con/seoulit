package app.staff.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffBoardPostReq {
    private String postType;
    private String title;
    private String content;
    private String eventDate;
    private String location;
    private String subjectName;
    private String departmentName;
    private String authorId;
    private String authorName;
    private String deletePin;
}
