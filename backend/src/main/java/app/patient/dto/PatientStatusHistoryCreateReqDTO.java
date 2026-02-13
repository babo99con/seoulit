package app.patient.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientStatusHistoryCreateReqDTO {
    private Long patientId;
    private String fromStatus;
    private String toStatus;
    private String reason;
    private String changedBy;
}

