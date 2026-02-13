package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Insurance response")
public class InsuranceResDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Insurance ID")
    private Long insuranceId;

    @Schema(description = "Patient ID")
    private Long patientId;

    @Schema(description = "Insurance type", example = "NHI")
    private String insuranceType;

    @Schema(description = "Policy number")
    private String policyNo;

    @Schema(description = "Active flag")
    private Boolean activeYn;

    @Schema(description = "Verified flag")
    private Boolean verifiedYn;

    @Schema(description = "Start date")
    private LocalDate startDate;

    @Schema(description = "End date")
    private LocalDate endDate;

    @Schema(description = "Note")
    private String note;

    @Schema(description = "Created timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Updated timestamp")
    private LocalDateTime updatedAt;
}

