package app.reception.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VisitReservationRes {
    private Long visitId;
    private String reservationId;
    private LocalDateTime scheduledAt;
    private LocalDateTime arrivalAt;
    private String note;
}
