package app.nursing.assessment.repository;

import app.nursing.assessment.entity.AssessmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssessmentRepository extends JpaRepository<AssessmentEntity, String> {

}
