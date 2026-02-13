package app.patient.repository;

import app.patient.entity.PatientFlagEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientFlagRepository extends JpaRepository<PatientFlagEntity, Long> {
}
