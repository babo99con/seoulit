package app.staff.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.util.Date;

@Entity
@Table(schema = "CMH", name = "STAFF_COMMON_DOC_LINE")
@Getter
@Setter
@NoArgsConstructor
public class StaffCommonDocLineEntity {

    @Id
    @Column(name = "ID")
    @SequenceGenerator(name = "staff_common_doc_line_seq_gen", sequenceName = "STAFF_COMMON_DOC_LINE_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "staff_common_doc_line_seq_gen")
    private Long id;

    @Column(name = "DOC_ID", nullable = false)
    private Long docId;

    @Column(name = "LINE_ORDER", nullable = false)
    private Integer lineOrder;

    @Column(name = "LINE_TYPE", nullable = false, length = 20)
    private String lineType;

    @Column(name = "APPROVER_ID", nullable = false, length = 100)
    private String approverId;

    @Column(name = "APPROVER_NAME", nullable = false, length = 100)
    private String approverName;

    @Column(name = "ACTION_STATUS", nullable = false, length = 20)
    private String actionStatus;

    @Column(name = "ACTION_COMMENT", length = 500)
    private String actionComment;

    @Column(name = "ACTED_AT")
    private Date actedAt;

    @Column(name = "CREATED_AT")
    private Date createdAt;
}
