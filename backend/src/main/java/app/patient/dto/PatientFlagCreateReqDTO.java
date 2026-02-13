package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;

@Getter
@AllArgsConstructor
@Schema(description = "Patient flag create request")
public class PatientFlagCreateReqDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Patient ID")
    private Long patientId;

    @Schema(description = "Flag type", example = "FALL_RISK")
    private String flagType;

    @Schema(description = "Note")
    private String note;
}
