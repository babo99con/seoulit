package app.reception.repository;

import app.reception.entity.VisitEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisitRepository extends JpaRepository<VisitEntity, Long> {
    List<VisitEntity> findAllByOrderByCreatedAtDesc();
}
