package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Insurance history response")
public class InsuranceHistoryResDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "History ID")
    private Long historyId;

    @Schema(description = "Insurance ID")
    private Long insuranceId;

    @Schema(description = "Patient ID")
    private Long patientId;

    @Schema(description = "Change type")
    private String changeType;

    @Schema(description = "Before snapshot (JSON)")
    private String beforeData;

    @Schema(description = "After snapshot (JSON)")
    private String afterData;

    @Schema(description = "Changed by")
    private String changedBy;

    @Schema(description = "Changed at")
    private LocalDateTime changedAt;
}

