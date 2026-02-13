package app.reception.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "VISIT_REG", schema = "CMH")
@Getter
@Setter
public class VisitEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "VISIT_REG_SEQ_GEN")
    @SequenceGenerator(name = "VISIT_REG_SEQ_GEN", sequenceName = "CMH.VISIT_REG_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "VISIT_NO", length = 30)
    private String visitNo;

    @Column(name = "PATIENT_ID", nullable = false)
    private Long patientId;

    @Column(name = "PATIENT_NO", length = 30)
    private String patientNo;

    @Column(name = "PATIENT_NAME", length = 100)
    private String patientName;

    @Column(name = "PATIENT_PHONE", length = 20)
    private String patientPhone;

    @Column(name = "VISIT_TYPE", nullable = false, length = 30)
    private String visitType;

    @Column(name = "STATUS", nullable = false, length = 30)
    private String status;

    @Column(name = "DEPT_CODE", nullable = false, length = 50)
    private String deptCode;

    @Column(name = "DOCTOR_ID", length = 50)
    private String doctorId;

    @Column(name = "PRIORITY_YN")
    private Boolean priorityYn;

    @Column(name = "QUEUE_NO")
    private Integer queueNo;

    @Column(name = "CALLED_AT")
    private LocalDateTime calledAt;

    @Column(name = "STARTED_AT")
    private LocalDateTime startedAt;

    @Column(name = "FINISHED_AT")
    private LocalDateTime finishedAt;

    @Column(name = "MEMO", length = 1000)
    private String memo;

    @Column(name = "CANCELLED_AT")
    private LocalDateTime cancelledAt;

    @Column(name = "CANCEL_REASON_CODE", length = 50)
    private String cancelReasonCode;

    @Column(name = "CANCEL_MEMO", length = 1000)
    private String cancelMemo;

    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
