package app.patient.entity;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_consent_history")
@Getter
@Setter
public class ConsentWithdrawHistoryEntity {

    @Id
    @SequenceGenerator(
            name = "consent_withdraw_history_seq",
            sequenceName = "CONSENT_WITHDRAW_HISTORY_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "consent_withdraw_history_seq")
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "consent_id", nullable = false)
    private Long consentId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "consent_type", nullable = false, length = 30)
    private String consentType;

    @Column(name = "withdrawn_at", nullable = false)
    private LocalDateTime withdrawnAt;

    @Column(name = "changed_by", length = 50)
    private String changedBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
