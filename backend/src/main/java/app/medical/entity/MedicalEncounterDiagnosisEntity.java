package app.medical.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "MEDICAL_ENCOUNTER_DIAGNOSIS", schema = "CMH")
@Getter
@Setter
public class MedicalEncounterDiagnosisEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "MEDICAL_ENC_DIAG_SEQ_GEN")
    @SequenceGenerator(name = "MEDICAL_ENC_DIAG_SEQ_GEN", sequenceName = "CMH.MEDICAL_ENC_DIAG_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "ENCOUNTER_ID", nullable = false)
    private Long encounterId;

    @Column(name = "DIAGNOSIS_CODE", nullable = false, length = 100)
    private String diagnosisCode;

    @Column(name = "DIAGNOSIS_NAME", length = 300)
    private String diagnosisName;

    @Column(name = "IS_PRIMARY", nullable = false, length = 1)
    private String isPrimary;

    @Column(name = "SORT_ORDER", nullable = false)
    private Integer sortOrder;

    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;
}
