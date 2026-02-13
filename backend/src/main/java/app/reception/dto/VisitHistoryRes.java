package app.reception.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VisitHistoryRes {
    private Long id;
    private Long visitId;
    private String eventType;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String reason;
    private String changedBy;
    private LocalDateTime changedAt;
}
