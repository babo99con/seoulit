package app.medical.repository;

import app.medical.entity.MedicalEncounterAssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalEncounterAssetRepository extends JpaRepository<MedicalEncounterAssetEntity, Long> {
    List<MedicalEncounterAssetEntity> findByEncounterIdOrderByCreatedAtDescIdDesc(Long encounterId);
}
