package app.staff.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.util.Date;

@Entity
@Table(schema = "CMH", name = "STAFF_HISTORY")
@Getter
@Setter
@NoArgsConstructor
public class StaffHistoryEntity {

    @Id
    @Column(name = "ID")
    @SequenceGenerator(name = "staff_history_seq_gen", sequenceName = "CMH.STAFF_HISTORY_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "staff_history_seq_gen")
    private Long id;

    @Column(name = "STAFF_ID", nullable = false)
    private Integer staffId;

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
    private Date changedAt;
}
