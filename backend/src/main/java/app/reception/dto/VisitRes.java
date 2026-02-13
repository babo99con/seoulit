package app.reception.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VisitRes {
    private Long id;
    private String visitNo;
    private Long patientId;
    private String patientNo;
    private String patientName;
    private String patientPhone;
    private String visitType;
    private String status;
    private String deptCode;
    private String doctorId;
    private Boolean priorityYn;
    private Integer queueNo;
    private LocalDateTime calledAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String memo;
    private LocalDateTime cancelledAt;
    private String cancelReasonCode;
    private String cancelMemo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String reservationId;
    private LocalDateTime scheduledAt;
    private LocalDateTime arrivalAt;
    private String reservationNote;
}
