package app.patient.entity;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_insurance")
@Getter @Setter
public class InsuranceEntity {

    @Id
    @SequenceGenerator(
            name = "patient_insurance_seq",
            sequenceName = "PATIENT_INSURANCE_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "patient_insurance_seq")
    @Column(name = "insurance_id")
    private Long insuranceId;

    // FK: patient(patient_id)
    @Column(name = "patient_id", nullable = false, length = 20)
    private Long patientId;

    @Column(name = "insurance_type", nullable = false, length = 30)
    private String insuranceType;

    @Column(name = "policy_no", length = 50)
    private String policyNo;

    @Column(name = "active_yn", nullable = false)
    private Boolean activeYn;   // TINYINT(1) -> Boolean

    @Column(name = "verified_yn", nullable = false)
    private Boolean verifiedYn; // TINYINT(1) -> Boolean

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "note", length = 255)
    private String note;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}

