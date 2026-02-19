package app.staff.repository;

import app.staff.entity.StaffHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffHistoryRepository extends JpaRepository<StaffHistoryEntity, Long> {
    List<StaffHistoryEntity> findByStaffIdOrderByChangedAtDescIdDesc(Integer staffId);
}
