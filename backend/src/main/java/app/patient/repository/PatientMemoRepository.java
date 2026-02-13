package app.patient.repository;

import app.patient.entity.PatientMemoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientMemoRepository extends JpaRepository<PatientMemoEntity, Long> {
}

