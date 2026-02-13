package app.patient.repository;

import app.patient.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatientRepository extends JpaRepository<PatientEntity, Long> {
    List<PatientEntity> findAllByStatusCodeNot(String statusCode);
}

