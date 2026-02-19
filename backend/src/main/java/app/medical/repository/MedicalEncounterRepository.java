package app.medical.repository;

import app.medical.entity.MedicalEncounterEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicalEncounterRepository extends JpaRepository<MedicalEncounterEntity, Long>, JpaSpecificationExecutor<MedicalEncounterEntity> {

    @Query("select distinct e.diagnosisCode from MedicalEncounterEntity e " +
            "where e.diagnosisCode is not null " +
            "and (:keyword is null or lower(e.diagnosisCode) like lower(concat('%', :keyword, '%'))) " +
            "order by e.diagnosisCode asc")
    List<String> findDistinctDiagnosisCodes(@Param("keyword") String keyword, Pageable pageable);
}
