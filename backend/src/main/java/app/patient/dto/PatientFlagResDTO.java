package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Patient flag response")
public class PatientFlagResDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Flag ID")
    private Long flagId;

    @Schema(description = "Patient ID")
    private Long patientId;

    @Schema(description = "Flag type")
    private String flagType;

    @Schema(description = "Note")
    private String note;

    @Schema(description = "Active flag")
    private Boolean activeYn;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;

    @Schema(description = "Updated at")
    private LocalDateTime updatedAt;
}
