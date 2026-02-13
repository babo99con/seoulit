package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(description = "Consent create request")
public class ConsentCreateReqDTO {

    @Schema(description = "Patient ID")
    private Long patientId;

    @Schema(description = "Consent type", example = "Privacy Policy Consent")
    private String consentType;

    @Schema(description = "File URL")
    private String fileUrl;

    @Schema(description = "Note")
    private String note;
}

