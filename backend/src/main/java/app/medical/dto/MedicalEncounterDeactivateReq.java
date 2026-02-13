package app.medical.dto;

import lombok.Data;

@Data
public class MedicalEncounterDeactivateReq {
    private String reasonCode;
    private String reasonMemo;
    private String updatedBy;
}
