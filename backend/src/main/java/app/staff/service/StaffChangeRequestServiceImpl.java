package app.staff.service;

import app.auth.util.PasswordHashUtil;
import app.staff.dto.StaffAssignmentUpdateReq;
import app.staff.dto.StaffChangeRequestCreateReq;
import app.staff.dto.StaffChangeRequestRes;
import app.staff.dto.StaffStatusUpdateReq;
import app.staff.entity.StaffChangeRequestEntity;
import app.staff.entity.StaffEntity;
import app.staff.repository.StaffChangeRequestRepository;
import app.staff.repository.StaffRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Transactional
public class StaffChangeRequestServiceImpl implements StaffChangeRequestService {

    private final StaffChangeRequestRepository changeRequestRepository;
    private final StaffRepository staffRepository;
    private final StaffService staffService;
    private final StaffAuditLogService staffAuditLogService;
    private final ObjectMapper objectMapper;

    public StaffChangeRequestServiceImpl(StaffChangeRequestRepository changeRequestRepository,
                                         StaffRepository staffRepository,
                                         StaffService staffService,
                                         StaffAuditLogService staffAuditLogService,
                                         ObjectMapper objectMapper) {
        this.changeRequestRepository = changeRequestRepository;
        this.staffRepository = staffRepository;
        this.staffService = staffService;
        this.staffAuditLogService = staffAuditLogService;
        this.objectMapper = objectMapper;
    }

    @Override
    public StaffChangeRequestRes createRequest(StaffChangeRequestCreateReq req, String requestedBy, String actorRole, String ip, String userAgent) {
        if (req.getStaffId() == null) {
            throw new IllegalArgumentException("staffId is required");
        }
        String requestType = normalizeRequestType(req.getRequestType());
        String payload = normalizePayload(requestType, req.getPayload());

        StaffChangeRequestEntity entity = new StaffChangeRequestEntity();
        entity.setStaffId(req.getStaffId());
        entity.setRequestType(requestType);
        entity.setRequestPayload(payload);
        entity.setReason(req.getReason());
        entity.setStatus("PENDING");
        entity.setRequestedBy(requestedBy);
        entity.setRequestedAt(new Date());
        StaffChangeRequestEntity saved = changeRequestRepository.save(entity);

        staffAuditLogService.log(
                "CHANGE_REQUEST_CREATED",
                "STAFF_CHANGE_REQUEST",
                String.valueOf(saved.getId()),
                requestedBy,
                actorRole,
                req.getReason(),
                null,
                payload,
                ip,
                userAgent
        );

        return toRes(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffChangeRequestRes> listRequests(String status, Integer staffId) {
        if (staffId != null && status != null && !status.trim().isEmpty()) {
            return changeRequestRepository
                    .findByStaffIdAndStatusOrderByRequestedAtDescIdDesc(staffId, status.trim().toUpperCase(Locale.ROOT))
                    .stream()
                    .map(this::toRes)
                    .collect(Collectors.toList());
        }
        if (staffId != null) {
            return changeRequestRepository.findByStaffIdOrderByRequestedAtDescIdDesc(staffId)
                    .stream()
                    .map(this::toRes)
                    .collect(Collectors.toList());
        }
        if (status != null && !status.trim().isEmpty()) {
            return changeRequestRepository.findByStatusOrderByRequestedAtDescIdDesc(status.trim().toUpperCase(Locale.ROOT))
                    .stream()
                    .map(this::toRes)
                    .collect(Collectors.toList());
        }
        return changeRequestRepository.findAllByOrderByRequestedAtDescIdDesc()
                .stream()
                .map(this::toRes)
                .collect(Collectors.toList());
    }

    @Override
    public StaffChangeRequestRes approve(Long id, String reviewer, String actorRole, String comment, String ip, String userAgent) {
        StaffChangeRequestEntity request = changeRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Change request not found: " + id));
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalArgumentException("이미 처리된 요청입니다.");
        }

        StaffEntity before = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new IllegalArgumentException("Staff id not found: " + request.getStaffId()));
        String oldValue = snapshotStaff(before);
        applyRequest(request, reviewer);
        StaffEntity after = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new IllegalArgumentException("Staff id not found: " + request.getStaffId()));
        String newValue = snapshotStaff(after);

        request.setStatus("APPROVED");
        request.setReviewedBy(reviewer);
        request.setReviewedAt(new Date());
        request.setReviewComment(comment);
        StaffChangeRequestEntity saved = changeRequestRepository.save(request);

        staffAuditLogService.log(
                "CHANGE_REQUEST_APPROVED",
                "STAFF_CHANGE_REQUEST",
                String.valueOf(saved.getId()),
                reviewer,
                actorRole,
                comment,
                oldValue,
                newValue,
                ip,
                userAgent
        );
        return toRes(saved);
    }

    @Override
    public StaffChangeRequestRes reject(Long id, String reviewer, String actorRole, String comment, String ip, String userAgent) {
        StaffChangeRequestEntity request = changeRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Change request not found: " + id));
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new IllegalArgumentException("이미 처리된 요청입니다.");
        }
        request.setStatus("REJECTED");
        request.setReviewedBy(reviewer);
        request.setReviewedAt(new Date());
        request.setReviewComment(comment);
        StaffChangeRequestEntity saved = changeRequestRepository.save(request);

        staffAuditLogService.log(
                "CHANGE_REQUEST_REJECTED",
                "STAFF_CHANGE_REQUEST",
                String.valueOf(saved.getId()),
                reviewer,
                actorRole,
                comment,
                null,
                request.getRequestPayload(),
                ip,
                userAgent
        );
        return toRes(saved);
    }

    private void applyRequest(StaffChangeRequestEntity request, String reviewer) {
        try {
            String type = normalizeRequestType(request.getRequestType());
            if ("STATUS_CHANGE".equals(type)) {
                StaffStatusUpdateReq payload = objectMapper.readValue(request.getRequestPayload(), StaffStatusUpdateReq.class);
                staffService.updateStaffStatus(request.getStaffId(), payload.getStatusCode(), payload.getReason(), reviewer);
                return;
            }
            if ("ASSIGNMENT_CHANGE".equals(type)) {
                StaffAssignmentUpdateReq payload = objectMapper.readValue(request.getRequestPayload(), StaffAssignmentUpdateReq.class);
                staffService.updateStaffAssignment(request.getStaffId(), payload.getDeptId(), payload.getPositionId(), payload.getReason(), reviewer);
                return;
            }
            if ("PASSWORD_RESET".equals(type)) {
                JsonNode node = objectMapper.readTree(request.getRequestPayload());
                String passwordHash = node.path("passwordHash").asText("");
                if (passwordHash.trim().isEmpty()) {
                    throw new IllegalArgumentException("password hash is missing");
                }
                staffService.resetStaffPasswordByHash(request.getStaffId(), passwordHash, reviewer);
                return;
            }
            throw new IllegalArgumentException("지원하지 않는 요청 유형입니다: " + type);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("요청 payload 파싱에 실패했습니다.");
        }
    }

    private String normalizeRequestType(String value) {
        String normalized = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("requestType is required");
        }
        if (!normalized.equals("STATUS_CHANGE") && !normalized.equals("ASSIGNMENT_CHANGE") && !normalized.equals("PASSWORD_RESET")) {
            throw new IllegalArgumentException("지원하지 않는 requestType 입니다.");
        }
        return normalized;
    }

    private String normalizePayload(String requestType, String payloadRaw) {
        if (payloadRaw == null || payloadRaw.trim().isEmpty()) {
            throw new IllegalArgumentException("payload is required");
        }
        try {
            JsonNode node = objectMapper.readTree(payloadRaw);
            if ("PASSWORD_RESET".equals(requestType)) {
                String newPassword = node.path("newPassword").asText("");
                if (newPassword.trim().length() < 8) {
                    throw new IllegalArgumentException("새 비밀번호는 8자 이상이어야 합니다.");
                }
                String hashed = PasswordHashUtil.hashNew(newPassword.trim());
                return objectMapper.writeValueAsString(objectMapper.createObjectNode().put("passwordHash", hashed));
            }
            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("payload 형식이 올바르지 않습니다.");
        }
    }

    private String snapshotStaff(StaffEntity staff) {
        try {
            return objectMapper.writeValueAsString(objectMapper.createObjectNode()
                    .put("staffId", staff.getId())
                    .put("statusCode", staff.getStatusCode())
                    .put("deptId", staff.getDeptId() == null ? -1 : staff.getDeptId())
                    .put("positionId", staff.getPositionId() == null ? -1 : staff.getPositionId()));
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private StaffChangeRequestRes toRes(StaffChangeRequestEntity e) {
        return new StaffChangeRequestRes(
                e.getId(),
                e.getStaffId(),
                e.getRequestType(),
                e.getReason(),
                e.getStatus(),
                e.getRequestedBy(),
                e.getRequestedAt(),
                e.getReviewedBy(),
                e.getReviewedAt(),
                e.getReviewComment(),
                e.getRequestPayload()
        );
    }
}
