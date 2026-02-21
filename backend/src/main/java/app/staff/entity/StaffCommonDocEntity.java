package app.staff.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.util.Date;

@Entity
@Table(schema = "CMH", name = "STAFF_COMMON_DOC")
@Getter
@Setter
@NoArgsConstructor
public class StaffCommonDocEntity {

    @Id
    @Column(name = "ID")
    @SequenceGenerator(name = "staff_common_doc_seq_gen", sequenceName = "STAFF_COMMON_DOC_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "staff_common_doc_seq_gen")
    private Long id;

    @Column(name = "CATEGORY", nullable = false, length = 30)
    private String category;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "CONTENT", length = 4000)
    private String content;

    @Column(name = "VERSION_LABEL", nullable = false, length = 20)
    private String versionLabel;

    @Column(name = "OWNER_NAME", nullable = false, length = 100)
    private String ownerName;

    @Column(name = "SENDER_DEPT_ID")
    private Long senderDeptId;

    @Column(name = "SENDER_DEPT_NAME", length = 100)
    private String senderDeptName;

    @Column(name = "RECEIVER_DEPT_ID")
    private Long receiverDeptId;

    @Column(name = "RECEIVER_DEPT_NAME", length = 100)
    private String receiverDeptName;

    @Column(name = "APPROVER_ID", length = 100)
    private String approverId;

    @Column(name = "APPROVER_NAME", length = 100)
    private String approverName;

    @Column(name = "APPROVAL_STATUS", length = 20)
    private String approvalStatus;

    @Column(name = "REJECTION_REASON", length = 500)
    private String rejectionReason;

    @Column(name = "ATTACH_FILE_NAME", length = 200)
    private String attachmentFileName;

    @Column(name = "ATTACH_MIME_TYPE", length = 100)
    private String attachmentMimeType;

    @Lob
    @Column(name = "ATTACH_BASE64")
    private String attachmentBase64;

    @Column(name = "AUTHOR_ID", nullable = false, length = 100)
    private String authorId;

    @Column(name = "AUTHOR_NAME", nullable = false, length = 100)
    private String authorName;

    @Column(name = "IS_DELETED", length = 1)
    private String isDeleted;

    @Column(name = "CREATED_AT")
    private Date createdAt;

    @Column(name = "UPDATED_AT")
    private Date updatedAt;
}
