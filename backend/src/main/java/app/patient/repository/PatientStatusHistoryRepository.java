package app.patient.repository;

import app.patient.entity.PatientStatusHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientStatusHistoryRepository extends JpaRepository<PatientStatusHistoryEntity, Long> {
}
