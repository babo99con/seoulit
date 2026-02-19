package app.staff.repository;

import app.staff.entity.StaffAuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffAuditLogRepository extends JpaRepository<StaffAuditLogEntity, Long> {
    List<StaffAuditLogEntity> findAllByOrderByCreatedAtDescIdDesc();
    List<StaffAuditLogEntity> findByTargetTypeOrderByCreatedAtDescIdDesc(String targetType);
    List<StaffAuditLogEntity> findByActionTypeOrderByCreatedAtDescIdDesc(String actionType);
}
