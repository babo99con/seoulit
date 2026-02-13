package app.patient.repository;

import app.patient.entity.PatientRestrictionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRestrictionRepository extends JpaRepository<PatientRestrictionEntity, Long> {
}

