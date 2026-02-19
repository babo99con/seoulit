package app.medical.dto;

import lombok.Data;

@Data
public class MedicalEncounterDiagnosisRes {
    private Long id;
    private String diagnosisCode;
    private String diagnosisName;
    private Boolean primary;
    private Integer sortOrder;
}
