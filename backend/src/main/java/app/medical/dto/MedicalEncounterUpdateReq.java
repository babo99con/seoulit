package app.medical.dto;

import lombok.Data;

import java.util.List;

@Data
public class MedicalEncounterUpdateReq {
    private String doctorId;
    private String deptCode;
    private String status;
    private String chiefComplaint;
    private String assessment;
    private String planNote;
    private String diagnosisCode;
    private List<MedicalEncounterDiagnosisReq> diagnoses;
    private String memo;
    private String updatedBy;
}
