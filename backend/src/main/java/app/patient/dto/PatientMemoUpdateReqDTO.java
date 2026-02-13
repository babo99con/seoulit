package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;

@Getter
@AllArgsConstructor
@Schema(description = "Patient memo update request")
public class PatientMemoUpdateReqDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "Memo text")
    private String memo;
}

