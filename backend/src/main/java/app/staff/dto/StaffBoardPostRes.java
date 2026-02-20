package app.staff.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StaffBoardPostRes {
    private Long id;
    private String category;
    private String postType;
    private String title;
    private String content;
    private String eventDate;
    private String location;
    private String subjectName;
    private String departmentName;
    private String authorId;
    private String authorName;
    private String createdAt;
    private String updatedAt;
}
