package app.patient.repository;

import app.patient.entity.PatientInfoHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatientInfoHistoryRepository extends JpaRepository<PatientInfoHistoryEntity, Long> {
    List<PatientInfoHistoryEntity> findByPatientIdOrderByChangedAtDesc(Long patientId);
}
