package app.medical.repository;

import app.medical.entity.MedicalEncounterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MedicalEncounterRepository extends JpaRepository<MedicalEncounterEntity, Long>, JpaSpecificationExecutor<MedicalEncounterEntity> {
}
