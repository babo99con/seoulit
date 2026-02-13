package app.reception.repository;

import app.reception.entity.VisitEmergencyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitEmergencyRepository extends JpaRepository<VisitEmergencyEntity, Long> {
}
