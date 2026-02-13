package app.nursing.vital.entity;

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
@Table(schema = "CHJ",name = "Vital_SIGN")
public class VitalEntity {

    @Id
    @Column(name = "Vital_ID")
    private String vitalId;

    @Column(name = "VISIT_ID")
    private String visitId;

    @Column(name = "TEMPERATURE")
    private String temperature;

    @Column(name = "PULSE")
    private String pulse;

    @Column(name = "RESPIRATION")
    private String respiration;

    @Column(name = "BLOOD_PRESSURE")
    private String bloodPressure;

    @Column(name = "MEASURED_AT")
    private LocalDateTime measuredAt;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "STATUS")
    private String status;

}
