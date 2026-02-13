package app.patient.entity;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_consent")
@Getter @Setter
public class ConsentEntity {

    @Id
    @SequenceGenerator(
            name = "patient_consent_seq",
            sequenceName = "PATIENT_CONSENT_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "patient_consent_seq")
    @Column(name = "consent_id")
    private Long consentId;

    // FK: patient(patient_id)
    @Column(name = "patient_id", nullable = false, length = 20)
    private Long patientId;

    @Column(name = "consent_type", nullable = false, length = 30)
    private String consentType;

    @Column(name = "active_yn", nullable = false)
    private Boolean activeYn;   // TINYINT(1) -> Boolean

    @Column(name = "agreed_at")
    private LocalDateTime agreedAt;

    @Column(name = "withdrawn_at")
    private LocalDateTime withdrawnAt;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "note", length = 255)
    private String note;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}

