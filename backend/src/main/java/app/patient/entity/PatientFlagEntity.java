package app.patient.entity;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_flag")
@Getter
@Setter
public class PatientFlagEntity {

    @Id
    @SequenceGenerator(
            name = "patient_flag_seq",
            sequenceName = "PATIENT_FLAG_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "patient_flag_seq")
    @Column(name = "flag_id")
    private Long flagId;

    @Column(name = "patient_id", nullable = false, length = 20)
    private Long patientId;

    @Column(name = "flag_type", nullable = false, length = 20)
    private String flagType;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "active_yn", nullable = false)
    private Boolean activeYn;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
