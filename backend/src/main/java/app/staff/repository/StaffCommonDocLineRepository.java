package app.staff.repository;

import app.staff.entity.StaffCommonDocLineEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffCommonDocLineRepository extends JpaRepository<StaffCommonDocLineEntity, Long> {
    List<StaffCommonDocLineEntity> findByDocIdOrderByLineOrderAscIdAsc(Long docId);
    void deleteByDocId(Long docId);
}
