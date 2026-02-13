package app.medical.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedicalEncounterListItemRes {
    private Long id;
    private Long visitId;
    private Long patientId;
    private String patientNo;
    private String patientName;
    private String doctorId;
    private String deptCode;
    private String status;
    private String isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
