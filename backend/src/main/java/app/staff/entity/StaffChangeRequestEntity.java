package app.staff.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(schema = "CMH", name = "STAFF_CHANGE_REQUEST")
@Getter
@Setter
@NoArgsConstructor
public class StaffChangeRequestEntity {

    @Id
    @Column(name = "ID")
    @SequenceGenerator(name = "staff_change_req_seq_gen", sequenceName = "CMH.STAFF_CHANGE_REQ_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "staff_change_req_seq_gen")
    private Long id;

    @Column(name = "STAFF_ID", nullable = false)
    private Integer staffId;

    @Column(name = "REQUEST_TYPE", length = 30, nullable = false)
    private String requestType;

    @Lob
    @Column(name = "REQUEST_PAYLOAD")
    private String requestPayload;

    @Column(name = "REASON", length = 500)
    private String reason;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "REQUESTED_BY", length = 50, nullable = false)
    private String requestedBy;

    @Column(name = "REQUESTED_AT", nullable = false)
    private Date requestedAt;

    @Column(name = "REVIEWED_BY", length = 50)
    private String reviewedBy;

    @Column(name = "REVIEWED_AT")
    private Date reviewedAt;

    @Column(name = "REVIEW_COMMENT", length = 500)
    private String reviewComment;
}
