package app.reception.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "VISIT_INPATIENT", schema = "CMH")
@Getter
@Setter
public class VisitInpatientEntity {

    @Id
    @Column(name = "VISIT_ID")
    private Long visitId;

    @Column(name = "WARD_CODE", length = 30)
    private String wardCode;

    @Column(name = "ROOM_NO", length = 30)
    private String roomNo;

    @Column(name = "BED_NO", length = 30)
    private String bedNo;

    @Column(name = "ADMISSION_AT")
    private LocalDateTime admissionAt;

    @Column(name = "NOTE", length = 1000)
    private String note;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
