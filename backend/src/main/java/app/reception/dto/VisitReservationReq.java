package app.reception.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VisitReservationReq {
    private String reservationId;
    private LocalDateTime scheduledAt;
    private LocalDateTime arrivalAt;
    private String note;
}
