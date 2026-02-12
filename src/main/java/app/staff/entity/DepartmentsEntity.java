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
import java.util.Date;

@Entity
@Table(schema = "CMH", name = "DEPARTMENTS")
@Getter
@Setter
@NoArgsConstructor
public class DepartmentsEntity {

    @Id
    @Column(name = "ID")
    @SequenceGenerator(name = "dept_seq_gen", sequenceName = "DEPT_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "dept_seq_gen")
    private Long id;

    // Display name
    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;

    @Column(name = "LOCATION", length = 100)
    private String location;

    @Column(name = "BUILDING_NO", length = 50)
    private String buildingNo;

    @Column(name = "FLOOR_NO", length = 10)
    private String floorNo;

    @Column(name = "ROOM_NO", length = 20)
    private String roomNo;

    @Column(name = "EXTENSION", length = 20)
    private String extension;

    @Column(name = "HEAD_STAFF_ID")
    private Long headStaffId;

    // Code + soft delete + ordering
    @Column(name = "DEPT_CODE", length = 30)
    private String deptCode;

    @Column(name = "IS_ACTIVE", length = 1)
    private String isActive;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder;

    @Column(name = "CREATED_AT")
    private Date createdAt;

    @Column(name = "UPDATED_AT")
    private Date updatedAt;
}

