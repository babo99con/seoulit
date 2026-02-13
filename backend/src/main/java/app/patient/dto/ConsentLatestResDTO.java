package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Latest consent status per type")
public class ConsentLatestResDTO {

    @Schema(description = "Consent ID")
    private Long consentId;

    @Schema(description = "Consent type")
    private String consentType;

    @Schema(description = "Active flag")
    private Boolean activeYn;

    @Schema(description = "Agreed timestamp")
    private LocalDateTime agreedAt;

    @Schema(description = "Withdrawal timestamp")
    private LocalDateTime withdrawnAt;
}
