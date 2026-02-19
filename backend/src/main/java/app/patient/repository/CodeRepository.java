package app.patient.repository;

import app.patient.entity.CodeEntity;
import app.patient.entity.CodeId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CodeRepository extends JpaRepository<CodeEntity, CodeId> {

    List<CodeEntity> findAllByGroupCodeAndIsActiveTrueOrderBySortOrderAscCodeAsc(String groupCode);

    @Query("select c from CodeEntity c " +
            "where c.isActive = true " +
            "and upper(c.groupCode) in ('DIAGNOSIS', 'DIAGNOSIS_CODE', 'ICD10', 'KCD', 'DISEASE') " +
            "and (:keyword is null or lower(c.code) like lower(concat('%', :keyword, '%')) or lower(c.name) like lower(concat('%', :keyword, '%'))) " +
            "order by c.sortOrder asc, c.code asc")
    List<CodeEntity> searchDiagnosisCodes(@Param("keyword") String keyword, Pageable pageable);

    boolean existsByGroupCodeAndCodeAndIsActiveTrue(String groupCode, String code);
}

