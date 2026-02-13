package app.nursing.specimen.repository;

import app.nursing.assessment.entity.AssessmentEntity;
import app.nursing.specimen.entity.SpecimenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecimenRepository extends JpaRepository<SpecimenEntity, String> {

}
