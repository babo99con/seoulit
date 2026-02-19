package app.medical.repository;

import app.medical.entity.MedicalEncounterDiagnosisEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalEncounterDiagnosisRepository extends JpaRepository<MedicalEncounterDiagnosisEntity, Long> {
    List<MedicalEncounterDiagnosisEntity> findByEncounterIdOrderBySortOrderAscIdAsc(Long encounterId);
    void deleteByEncounterId(Long encounterId);
}
