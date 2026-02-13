package app.reception.repository;

import app.reception.entity.VisitReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface VisitReservationRepository extends JpaRepository<VisitReservationEntity, Long> {
    List<VisitReservationEntity> findByVisitIdIn(Collection<Long> visitIds);
}
