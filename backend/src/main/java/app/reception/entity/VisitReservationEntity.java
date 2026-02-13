package app.reception.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "VISIT_RESERVATION", schema = "CMH")
@Getter
@Setter
public class VisitReservationEntity {

    @Id
    @Column(name = "VISIT_ID")
    private Long visitId;

    @Column(name = "RESERVATION_ID", length = 50)
    private String reservationId;

    @Column(name = "SCHEDULED_AT")
    private LocalDateTime scheduledAt;

    @Column(name = "ARRIVAL_AT")
    private LocalDateTime arrivalAt;

    @Column(name = "NOTE", length = 1000)
    private String note;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
