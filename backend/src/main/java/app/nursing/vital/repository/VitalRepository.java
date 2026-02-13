package app.nursing.vital.repository;

import app.nursing.assessment.entity.AssessmentEntity;
import app.nursing.vital.entity.VitalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VitalRepository extends JpaRepository<VitalEntity, String> {

}
