package app.reception.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "VISIT_EMERGENCY", schema = "CMH")
@Getter
@Setter
public class VisitEmergencyEntity {

    @Id
    @Column(name = "VISIT_ID")
    private Long visitId;

    @Column(name = "TRIAGE_LEVEL", length = 20)
    private String triageLevel;

    @Column(name = "AMBULANCE_YN")
    private Boolean ambulanceYn;

    @Column(name = "TRAUMA_YN")
    private Boolean traumaYn;

    @Column(name = "NOTE", length = 1000)
    private String note;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
