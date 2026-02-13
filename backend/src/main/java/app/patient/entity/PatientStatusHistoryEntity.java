package app.patient.entity;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_status_history")
@Getter
@Setter
public class PatientStatusHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "psh_seq")
    @SequenceGenerator(
            name = "psh_seq",
            sequenceName = "PATIENT_STATUS_HISTORY_SEQ",
            allocationSize = 1
    )
    @Column(name = "HISTORY_ID")
    private Long historyId;


    @Column(name = "patient_id", nullable = false, length = 20)
    private Long patientId;

    @Column(name = "from_status", nullable = false, length = 20)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 20)
    private String toStatus;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "changed_by", length = 20)
    private String changedBy;

    @Column(name = "changed_at", insertable = false, updatable = false)
    private LocalDateTime changedAt;
}

