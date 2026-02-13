package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;

@Getter
@AllArgsConstructor
@Schema(description = "Patient memo create request")
public class PatientMemoCreateReqDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Patient ID", example = "PT202601260001")
    private Long patientId;

    @Schema(description = "Memo text")
    private String memo;

    @Schema(description = "Created by")
    private String createdBy;
}

