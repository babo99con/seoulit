package app.medical.repository;

import app.medical.entity.MedicalEncounterHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalEncounterHistoryRepository extends JpaRepository<MedicalEncounterHistoryEntity, Long> {
    List<MedicalEncounterHistoryEntity> findByEncounterIdOrderByChangedAtDescIdDesc(Long encounterId);
}
