package app.reception.repository;

import app.reception.entity.VisitHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisitHistoryRepository extends JpaRepository<VisitHistoryEntity, Long> {
    List<VisitHistoryEntity> findByVisitIdOrderByChangedAtDescIdDesc(Long visitId);

    List<VisitHistoryEntity> findAllByOrderByChangedAtDescIdDesc();
}
