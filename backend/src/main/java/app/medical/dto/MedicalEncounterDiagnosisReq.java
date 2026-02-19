package app.medical.dto;

import lombok.Data;

@Data
public class MedicalEncounterDiagnosisReq {
    private String diagnosisCode;
    private String diagnosisName;
    private Boolean primary;
}
