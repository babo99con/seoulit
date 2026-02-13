package app.patient.entity;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_memo")
@Getter
@Setter
public class PatientMemoEntity {

    @Id
    @SequenceGenerator(
            name = "patient_memo_seq",
            sequenceName = "PATIENT_MEMO_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "patient_memo_seq")
    @Column(name = "memo_id")
    private Long memoId;

    @Column(name = "patient_id", nullable = false, length = 20)
    private Long patientId;

    @Column(name = "memo", nullable = false, columnDefinition = "TEXT")
    private String memo;

    @Column(name = "created_by", length = 20)
    private String createdBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}

