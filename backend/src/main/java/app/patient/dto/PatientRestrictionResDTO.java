package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Patient restriction response")
public class PatientRestrictionResDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Restriction ID")
    private Long restrictionId;

    @Schema(description = "Patient ID")
    private Long patientId;

    @Schema(description = "Restriction type")
    private String restrictionType;

    @Schema(description = "Active flag")
    private Boolean activeYn;

    @Schema(description = "Reason")
    private String reason;

    @Schema(description = "Start datetime")
    private LocalDateTime startAt;

    @Schema(description = "End datetime")
    private LocalDateTime endAt;

    @Schema(description = "Created by")
    private String createdBy;
}

