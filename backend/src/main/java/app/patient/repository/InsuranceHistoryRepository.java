package app.patient.repository;

import app.patient.entity.InsuranceHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InsuranceHistoryRepository extends JpaRepository<InsuranceHistoryEntity, Long> {
    List<InsuranceHistoryEntity> findByPatientIdOrderByChangedAtDesc(Long patientId);
}

