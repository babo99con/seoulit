package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Patient restriction update request")
public class PatientRestrictionUpdateReqDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Restriction type", example = "BLACKLIST")
    private String restrictionType;

    @Schema(description = "Active flag")
    private Boolean activeYn;

    @Schema(description = "Reason")
    private String reason;

    @Schema(description = "Restriction end datetime")
    private LocalDateTime endAt;
}

