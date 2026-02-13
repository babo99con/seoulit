package app.patient.entity;

import javax.persistence.*;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_restriction")
@Getter
@Setter
public class PatientRestrictionEntity {

    @Id
    @SequenceGenerator(
            name = "patient_restriction_seq",
            sequenceName = "PATIENT_RESTRICTION_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "patient_restriction_seq")
    @Column(name = "restriction_id")
    private Long restrictionId;

    @Column(name = "patient_id", nullable = false, length = 20)
    private Long patientId;

    @Column(name = "restriction_type", nullable = false, length = 30)
    private String restrictionType;

    @Column(name = "active_yn", nullable = false)
    private Boolean activeYn;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "start_at", insertable = false, updatable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(name = "created_by", length = 20)
    private String createdBy;
}

