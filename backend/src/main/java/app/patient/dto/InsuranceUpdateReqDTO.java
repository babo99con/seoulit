package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
@Schema(description = "Insurance update request")
public class InsuranceUpdateReqDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Insurance type", example = "NHI")
    private String insuranceType;

    @Schema(description = "Policy number", example = "POL-1234-5678")
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
}

