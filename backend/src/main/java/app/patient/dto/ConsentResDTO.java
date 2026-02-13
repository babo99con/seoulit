package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Consent response")
public class ConsentResDTO {

    @Schema(description = "Consent ID")
    private Long consentId;

    @Schema(description = "Patient ID")
    private Long patientId;

    @Schema(description = "Consent type")
    private String consentType;

    @Schema(description = "Active flag")
    private Boolean activeYn;

    @Schema(description = "Agreed timestamp")
    private LocalDateTime agreedAt;

    @Schema(description = "Withdrawal timestamp")
    private LocalDateTime withdrawnAt;

    @Schema(description = "File URL")
    private String fileUrl;

    @Schema(description = "Note")
    private String note;

    @Schema(description = "Created timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Updated timestamp")
    private LocalDateTime updatedAt;
}

