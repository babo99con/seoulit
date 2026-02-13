package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
@Schema(description = "Insurance create request")
public class InsuranceCreateReqDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Patient ID")
    private Long patientId;

    @Schema(description = "Insurance type", example = "NHI")
    private String insuranceType;

    @Schema(description = "Policy number", example = "POL-1234-5678")
    private String policyNo;

    @Schema(description = "Start date")
    private LocalDate startDate;

    @Schema(description = "End date")
    private LocalDate endDate;

    @Schema(description = "Note")
    private String note;
}

