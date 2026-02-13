package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Consent update request")
public class ConsentUpdateReqDTO {

    @Schema(description = "Active flag")
    private Boolean activeYn;

    @Schema(description = "File URL")
    private String fileUrl;

    @Schema(description = "Note")
    private String note;

    @Schema(description = "Agreed timestamp")
    private LocalDateTime agreedAt;

    @Schema(description = "Withdrawal timestamp")
    private LocalDateTime withdrawnAt;
}

