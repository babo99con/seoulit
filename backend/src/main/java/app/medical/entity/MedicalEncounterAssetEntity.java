package app.medical.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "MEDICAL_ENCOUNTER_ASSET", schema = "CMH")
@Getter
@Setter
public class MedicalEncounterAssetEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "MEDICAL_ENC_ASSET_SEQ_GEN")
    @SequenceGenerator(name = "MEDICAL_ENC_ASSET_SEQ_GEN", sequenceName = "CMH.MEDICAL_ENC_ASSET_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "ENCOUNTER_ID", nullable = false)
    private Long encounterId;

    @Column(name = "PATIENT_ID", nullable = false)
    private Long patientId;

    @Column(name = "ASSET_TYPE", nullable = false, length = 20)
    private String assetType;

    @Column(name = "TEMPLATE_CODE", length = 50)
    private String templateCode;

    @Column(name = "OBJECT_KEY", nullable = false, length = 500)
    private String objectKey;

    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;
}
