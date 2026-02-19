package app.staff.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(schema = "CMH", name = "STAFF_AUDIT_LOG")
@Getter
@Setter
@NoArgsConstructor
public class StaffAuditLogEntity {

    @Id
    @Column(name = "ID")
    @SequenceGenerator(name = "staff_audit_log_seq_gen", sequenceName = "CMH.STAFF_AUDIT_LOG_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "staff_audit_log_seq_gen")
    private Long id;

    @Column(name = "ACTION_TYPE", length = 50, nullable = false)
    private String actionType;

    @Column(name = "TARGET_TYPE", length = 50)
    private String targetType;

    @Column(name = "TARGET_ID", length = 50)
    private String targetId;

    @Column(name = "ACTOR", length = 50)
    private String actor;

    @Column(name = "ACTOR_ROLE", length = 50)
    private String actorRole;

    @Column(name = "REASON", length = 500)
    private String reason;

    @Column(name = "OLD_VALUE", length = 2000)
    private String oldValue;

    @Column(name = "NEW_VALUE", length = 2000)
    private String newValue;

    @Column(name = "IP_ADDRESS", length = 64)
    private String ipAddress;

    @Column(name = "USER_AGENT", length = 500)
    private String userAgent;

    @Column(name = "CREATED_AT", nullable = false)
    private Date createdAt;
}
