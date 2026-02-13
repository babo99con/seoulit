package app.nursing.vital.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class VitalDTO {

    private String vitalId;
    private String visitId;
    private String temperature;
    private String pulse;
    private String respiration;
    private String bloodPressure;
    private LocalDateTime measuredAt;
    private LocalDateTime createdAt;
    private String status;
}
