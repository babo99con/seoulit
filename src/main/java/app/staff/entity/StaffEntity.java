package app.staff.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import java.util.Date;

@Entity
@Table(schema = "CMH", name = "STAFF")
@Getter
@Setter
@NoArgsConstructor
public class StaffEntity {

    @Id
    @Column(name = "ID")
    @SequenceGenerator(name = "staff_seq_gen", sequenceName = "STAFF_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "staff_seq_gen")
    private int id;
    // Oracle sequence is handled by DB trigger

    @Column(name = "USERNAME", nullable = false, length = 50)
    private String username;

    // New model: status_code references staff_status_codes.code (no FK enforced)
    @Column(name = "STATUS_CODE", length = 20)
    private String statusCode;

    // Legacy column kept for backward compatibility (optional)
    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "DOMAIN_ROLE", length = 50)
    private String domainRole;

    @Column(name = "FULL_NAME", length = 100)
    private String fullName;

    @Column(name = "OFFICE_LOCATION", length = 255)
    private String officeLocation;

    @Column(name = "PHOTO_KEY", length = 255)
    private String photoKey;

    @Transient
    private String photoUrl;

    @Lob
    @Column(name = "BIO")
    private String bio;

    @Column(name = "PHONE", length = 20)
    private String phone;

    // Main department/position (single)
    @Column(name = "DEPT_ID")
    private Long deptId;

    @Column(name = "POSITION_ID")
    private Long positionId;

    @Column(name = "CREATED_AT")
    private Date createdAt;

    @Column(name = "UPDATED_AT")
    private Date updatedAt;
}

