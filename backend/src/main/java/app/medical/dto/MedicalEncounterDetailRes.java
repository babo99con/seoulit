package app.medical.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedicalEncounterDetailRes {
    private Long id;
    private Long visitId;
    private Long patientId;
    private String patientNo;
    private String patientName;
    private String doctorId;
    private String deptCode;
    private String status;
    private String chiefComplaint;
    private String assessment;
    private String planNote;
    private String diagnosisCode;
    private String memo;
    private String isActive;
    private String inactiveReasonCode;
    private String inactiveReasonMemo;
    private LocalDateTime inactivatedAt;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
