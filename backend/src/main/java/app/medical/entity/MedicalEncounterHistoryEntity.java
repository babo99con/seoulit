package app.medical.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "MEDICAL_ENCOUNTER_HISTORY", schema = "CMH")
@Getter
@Setter
public class MedicalEncounterHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "MEDICAL_ENCOUNTER_HIS_SEQ_GEN")
    @SequenceGenerator(name = "MEDICAL_ENCOUNTER_HIS_SEQ_GEN", sequenceName = "CMH.MEDICAL_ENCOUNTER_HIS_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "ENCOUNTER_ID", nullable = false)
    private Long encounterId;

    @Column(name = "EVENT_TYPE", length = 30)
    private String eventType;

    @Column(name = "FIELD_NAME", length = 50)
    private String fieldName;

    @Column(name = "OLD_VALUE", length = 2000)
    private String oldValue;

    @Column(name = "NEW_VALUE", length = 2000)
    private String newValue;

    @Column(name = "REASON", length = 500)
    private String reason;

    @Column(name = "CHANGED_BY", length = 50)
    private String changedBy;

    @Column(name = "CHANGED_AT", nullable = false)
    private LocalDateTime changedAt;
}
