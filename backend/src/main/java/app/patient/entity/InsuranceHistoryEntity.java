package app.patient.entity;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_insurance_history")
@Getter
@Setter
public class InsuranceHistoryEntity {

    @Id
    @SequenceGenerator(
            name = "patient_insurance_history_seq",
            sequenceName = "PATIENT_INSURANCE_HISTORY_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "patient_insurance_history_seq")
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "insurance_id", nullable = false)
    private Long insuranceId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "change_type", nullable = false, length = 20)
    private String changeType;

    @Lob
    @Column(name = "before_data")
    private String beforeData;

    @Lob
    @Column(name = "after_data")
    private String afterData;

    @Column(name = "changed_by", length = 50)
    private String changedBy;

    @Column(name = "changed_at", insertable = false, updatable = false)
    private LocalDateTime changedAt;
}

