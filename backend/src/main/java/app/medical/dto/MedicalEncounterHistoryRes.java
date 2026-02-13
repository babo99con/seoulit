package app.medical.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedicalEncounterHistoryRes {
    private Long id;
    private Long encounterId;
    private String eventType;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String reason;
    private String changedBy;
    private LocalDateTime changedAt;
}
