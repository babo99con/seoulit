package app.patient.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_info_history")
@Getter
@Setter
public class PatientInfoHistoryEntity {

    @Id
    @SequenceGenerator(
            name = "patient_info_history_seq",
            sequenceName = "PATIENT_INFO_HISTORY_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "patient_info_history_seq")
    @Column(name = "history_id")
    private Long historyId;

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
