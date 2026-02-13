package app.patient.repository;

import app.patient.entity.CodeEntity;
import app.patient.entity.CodeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodeRepository extends JpaRepository<CodeEntity, CodeId> {

    List<CodeEntity> findAllByGroupCodeAndIsActiveTrueOrderBySortOrderAscCodeAsc(String groupCode);

    boolean existsByGroupCodeAndCodeAndIsActiveTrue(String groupCode, String code);
}

