package app.staff.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StaffCommonDocRes {
    private Long id;
    private String box;
    private String category;
    private String title;
    private String content;
    private String versionLabel;
    private String ownerName;
    private Long senderDeptId;
    private String senderDeptName;
    private Long receiverDeptId;
    private String receiverDeptName;
    private String approverId;
    private String approverName;
    private String approvalStatus;
    private String rejectionReason;
    private String attachmentFileName;
    private String attachmentMimeType;
    private boolean hasAttachment;
    private List<StaffCommonDocLineRes> lines;
    private String authorId;
    private String authorName;
    private String createdAt;
    private String updatedAt;
}
