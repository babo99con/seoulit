package app.reception.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VisitCreateReq {
    private String visitNo;
    private Long patientId;
    private String patientNo;
    private String patientName;
    private String patientPhone;
    private String visitType;
    private String deptCode;
    private String doctorId;
    private Boolean priorityYn;
    private Integer queueNo;
    private String memo;
    private String createdBy;
    private String reservationId;
    private LocalDateTime scheduledAt;
    private LocalDateTime arrivalAt;
    private String reservationNote;
}
