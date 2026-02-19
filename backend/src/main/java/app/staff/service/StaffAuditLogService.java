package app.staff.service;

import app.staff.dto.StaffAuditLogRes;
import app.staff.entity.StaffAuditLogEntity;
import app.staff.repository.StaffAuditLogRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class StaffAuditLogService {

    private static final Logger LOGGER = LoggerFactory.getLogger(StaffAuditLogService.class);

    private final StaffAuditLogRepository auditLogRepository;

    public StaffAuditLogService(StaffAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String actionType,
                    String targetType,
                    String targetId,
                    String actor,
                    String actorRole,
                    String reason,
                    String oldValue,
                    String newValue,
                    String ipAddress,
                    String userAgent) {
        StaffAuditLogEntity entity = new StaffAuditLogEntity();
        entity.setActionType(actionType);
        entity.setTargetType(targetType);
        entity.setTargetId(targetId);
        entity.setActor(actor);
        entity.setActorRole(actorRole);
        entity.setReason(reason);
        entity.setOldValue(oldValue);
        entity.setNewValue(newValue);
        entity.setIpAddress(ipAddress);
        entity.setUserAgent(userAgent);
        entity.setCreatedAt(new Date());
        try {
            auditLogRepository.save(entity);
        } catch (Exception e) {
            LOGGER.warn("Skip audit log persistence due to error: {}", e.getMessage());
        }
    }

    public List<StaffAuditLogRes> list(String targetType, String actionType, Integer limit) {
        List<StaffAuditLogEntity> entities;
        String normalizedTargetType = targetType == null ? null : targetType.trim().toUpperCase(Locale.ROOT);
        String normalizedActionType = actionType == null ? null : actionType.trim().toUpperCase(Locale.ROOT);

        if (normalizedTargetType != null && !normalizedTargetType.isEmpty()) {
            entities = auditLogRepository.findByTargetTypeOrderByCreatedAtDescIdDesc(normalizedTargetType);
        } else if (normalizedActionType != null && !normalizedActionType.isEmpty()) {
            entities = auditLogRepository.findByActionTypeOrderByCreatedAtDescIdDesc(normalizedActionType);
        } else {
            entities = auditLogRepository.findAllByOrderByCreatedAtDescIdDesc();
        }

        int safeLimit = limit == null ? 200 : Math.max(1, Math.min(limit, 1000));
        return entities.stream()
                .limit(safeLimit)
                .map(this::toRes)
                .collect(Collectors.toList());
    }

    private StaffAuditLogRes toRes(StaffAuditLogEntity e) {
        return new StaffAuditLogRes(
                e.getId(),
                e.getActionType(),
                e.getTargetType(),
                e.getTargetId(),
                e.getActor(),
                e.getActorRole(),
                e.getReason(),
                e.getOldValue(),
                e.getNewValue(),
                e.getIpAddress(),
                e.getUserAgent(),
                e.getCreatedAt()
        );
    }
}
