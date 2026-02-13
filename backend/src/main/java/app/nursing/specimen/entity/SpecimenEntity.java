package app.nursing.specimen.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(schema = "CHJ",name = "SPECIMEN")
public class SpecimenEntity {

    @Id
    @Column(name = "SPECIMEN_ID")
    private String specimenId;

    @Column(name = "VISIT_ID")
    private String visitId;

    @Column(name = "SPECIMEN_TYPE")
    private String specimenType;

    @Column(name = "COLLECTED_AT")
    private LocalDateTime collectedAt;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @Column(name = "CREATED_BY")
    private String createdBy;
}
