package app.reception.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "VISIT_HISTORY", schema = "CMH")
@Getter
@Setter
public class VisitHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "VISIT_HISTORY_SEQ_GEN")
    @SequenceGenerator(name = "VISIT_HISTORY_SEQ_GEN", sequenceName = "CMH.VISIT_HISTORY_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "VISIT_ID", nullable = false)
    private Long visitId;

    @Column(name = "EVENT_TYPE", length = 30)
    private String eventType;

    @Column(name = "FIELD_NAME", length = 50)
    private String fieldName;

    @Column(name = "OLD_VALUE", length = 1000)
    private String oldValue;

    @Column(name = "NEW_VALUE", length = 1000)
    private String newValue;

    @Column(name = "REASON", length = 500)
    private String reason;

    @Column(name = "CHANGED_BY", length = 50)
    private String changedBy;

    @Column(name = "CHANGED_AT", nullable = false)
    private LocalDateTime changedAt;
}
