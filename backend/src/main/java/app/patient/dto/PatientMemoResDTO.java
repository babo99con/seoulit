package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Schema(description = "Patient memo response")
public class PatientMemoResDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Memo ID")
    private Long memoId;

    @Schema(description = "Patient ID")
    private Long patientId;

    @Schema(description = "Memo text")
    private String memo;

    @Schema(description = "Created by")
    private String createdBy;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;
}

