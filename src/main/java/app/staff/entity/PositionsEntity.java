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
@Table(schema = "CMH" , name = "POSITIONS")
@Getter
@Setter
@NoArgsConstructor
public class PositionsEntity {

    @Id
    @Column(name = "ID")
    @SequenceGenerator(name = "position_seq_gen", sequenceName = "POSITION_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "position_seq_gen")
    private Long id;

    @Column(name = "DOMAIN", length = 50)
    private String domain;

    // Display title
    @Column(name = "TITLE", length = 100)
    private String title;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;

    // Code + soft delete + ordering
    @Column(name = "POSITION_CODE", length = 30)
    private String positionCode;

    @Column(name = "IS_ACTIVE", length = 1)
    private String isActive;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder;

    @Column(name = "CREATED_AT")
    private Date createdAt;

    @Column(name = "UPDATED_AT")
    private Date updatedAt;
}

