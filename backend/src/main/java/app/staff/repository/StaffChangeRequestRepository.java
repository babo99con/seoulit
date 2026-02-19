package app.staff.repository;

import app.staff.entity.StaffChangeRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffChangeRequestRepository extends JpaRepository<StaffChangeRequestEntity, Long> {
    List<StaffChangeRequestEntity> findByStatusOrderByRequestedAtDescIdDesc(String status);
    List<StaffChangeRequestEntity> findByStaffIdOrderByRequestedAtDescIdDesc(Integer staffId);
    List<StaffChangeRequestEntity> findByStaffIdAndStatusOrderByRequestedAtDescIdDesc(Integer staffId, String status);
    List<StaffChangeRequestEntity> findAllByOrderByRequestedAtDescIdDesc();
}
