package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Consent withdraw history")
public class ConsentWithdrawHistoryResDTO {

    @Schema(description = "History ID")
    private Long historyId;

    @Schema(description = "Consent ID")
    private Long consentId;

    @Schema(description = "Consent type")
    private String consentType;

    @Schema(description = "Withdrawal timestamp")
    private LocalDateTime withdrawnAt;

    @Schema(description = "Changed by")
    private String changedBy;

    @Schema(description = "Created timestamp")
    private LocalDateTime createdAt;
}
