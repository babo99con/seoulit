package app.staff.domain;

import lombok.Data;
import javax.persistence.*;
import java.util.Date;

@Data
@Entity
@Table(name = "staff_members", uniqueConstraints = @UniqueConstraint(columnNames = "staff_no"))
public class StaffMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId; // auth 서비스의 users.id

    @Column(name = "staff_no", nullable = false)
    private String staffNo;

    @Column(name = "staff_type", nullable = false)
    private String staffType; // DOCTOR/NURSE/STAFF/ADMIN 등

    @Column(name = "dept_id")
    private Long deptId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "hired_at")
    @Temporal(TemporalType.DATE)
    private Date hiredAt;
}
