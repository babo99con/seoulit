package app.staff.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class StaffCommonDocReq {
    private String box;
    private String category;
    private String title;
    private String content;
    private String versionLabel;
    private String ownerName;
    private Long receiverDeptId;
    private String receiverDeptName;
    private String approverId;
    private String approverName;
    private List<String> approverIds;
    private List<String> ccIds;
    private Long lineId;
    private String approvalAction;
    private String rejectionReason;
    private String attachmentFileName;
    private String attachmentMimeType;
    private String attachmentBase64;
    private String authorId;
    private String authorName;
}
