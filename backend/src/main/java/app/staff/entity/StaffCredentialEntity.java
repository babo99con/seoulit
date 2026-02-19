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
@Table(schema = "CMH", name = "STAFF_CREDENTIAL")
@Getter
@Setter
@NoArgsConstructor
public class StaffCredentialEntity{

    @Id
    @Column(name = "ID")
    @SequenceGenerator(name = "staff_credential_seq_gen", sequenceName = "CMH.STAFF_CREDENTIAL_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "staff_credential_seq_gen")
    private int id;
    // Oracle sequence is handled by DB trigger

    @Column(name = "STAFF_ID", nullable = false)
    private int staffId;

    @Column(name = "CRED_TYPE", nullable = false, length = 10)
    private String credType;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "CRED_NUMBER", length = 50)
    private String credNumber;

    @Column(name = "ISSUER", length = 100)
    private String issuer;

    @Column(name = "ISSUED_AT")
    private Date issuedAt;

    @Column(name = "EXPIRES_AT")
    private Date expiresAt;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status;

    @Column(name = "EVIDENCE_KEY", length = 255)
    private String evidenceKey;

    @Column(name = "CREATED_AT")
    private Date createdAt;

    @Column(name = "UPDATED_AT")
    private Date updatedAt;
}
