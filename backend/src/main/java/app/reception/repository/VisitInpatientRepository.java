package app.reception.repository;

import app.reception.entity.VisitInpatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitInpatientRepository extends JpaRepository<VisitInpatientEntity, Long> {
}
