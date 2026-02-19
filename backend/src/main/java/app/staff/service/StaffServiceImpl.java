package app.staff.service;

import app.auth.util.PasswordHashUtil;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import app.staff.dto.StaffHistoryItemRes;
import app.staff.storage.StaffStorageService;
import app.staff.dto.StaffSelfUpdateReq;
import app.staff.entity.DepartmentsEntity;
import app.staff.entity.PositionsEntity;
import app.staff.dto.StaffListItem;
import app.staff.entity.StaffHistoryEntity;
import app.staff.entity.StaffEntity;
import app.staff.repository.DepartmentRepository;
import app.staff.repository.PositionRepository;
import app.staff.repository.StaffHistoryRepository;
import app.staff.repository.StaffRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;



@Service
@Slf4j
public class StaffServiceImpl implements StaffService {

    private static final String INITIAL_PASSWORD = "1111";

    private static final String CACHE_STAFF_LIST = "STAFF_LIST";
    private static final String CACHE_STAFF_DETAIL = "STAFF_DETAIL";

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private StaffStorageService staffStorageService;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private StaffHistoryRepository staffHistoryRepository;

    @Override
    public void createStaff(StaffEntity staff, MultipartFile file) {
        String username = staff.getUsername() == null ? "" : staff.getUsername().trim();
        if (username.isEmpty()) {
            throw new IllegalArgumentException("Staff username is required");
        }
        if (staffRepository.countByUsernameNormalized(username) > 0) {
            throw new IllegalArgumentException("Staff username already exists: " + username);
        }
        staff.setUsername(username);
        staff.setPasswordHash(PasswordHashUtil.hashNew(INITIAL_PASSWORD));
        validateDepartmentAndPosition(staff.getDeptId(), staff.getPositionId());
        if (staff.getStatusCode() == null || staff.getStatusCode().trim().isEmpty()) {
            staff.setStatusCode("ACTIVE");
        }
        if (staff.getCreatedAt() == null) {
            staff.setCreatedAt(new Date());
        }
        if (file != null && !file.isEmpty()) {
            staff.setPhotoKey(uploadProfileImage(staff.getUsername(), file));
        }
        staff.setUpdatedAt(new Date());
        staffRepository.save(staff);
    }

    @Override
    @Cacheable(cacheNames = CACHE_STAFF_LIST, key = "'list:' + #activeOnly")
    public List<StaffListItem> selectStaffList(boolean activeOnly) {
        return staffRepository.findStaffList(activeOnly)
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffListItem> searchByName(boolean activeOnly, String value) {
        return staffRepository.searchByName(activeOnly, value)
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffListItem> searchByDepartmentName(boolean activeOnly, String value) {
        return staffRepository.searchByDepartmentName(activeOnly, value)
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffListItem> searchByPositionTitle(boolean activeOnly, String value) {
        return staffRepository.searchByPositionTitle(activeOnly, value)
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffListItem> searchByStaffType(boolean activeOnly, String value) {
        return staffRepository.searchByStaffType(activeOnly, value)
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffListItem> searchByStaffId(boolean activeOnly, String value) {
        return staffRepository.searchByStaffId(activeOnly, value)
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(cacheNames = CACHE_STAFF_DETAIL, key = "'detail:' + #id")
    public StaffEntity selectStaffDetail(int id) {
        StaffEntity staff = staffRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff id not found: " + id));
        staff.setPhotoUrl(staffStorageService.getPresignedUrl(staff.getPhotoKey()));
        return staff;
    }

    @Override
    public boolean existsUsername(String username) {
        String normalized = username == null ? "" : username.trim();
        if (normalized.isEmpty()) {
            return false;
        }
        return staffRepository.countByUsernameNormalized(normalized) > 0;
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_STAFF_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_STAFF_DETAIL, key = "'detail:' + #staff.id")
    })
    public void updateStaff(StaffEntity staff, MultipartFile file) {
        StaffEntity existing = staffRepository
                .findById(staff.getId())
                .orElseThrow(() -> new IllegalArgumentException("Staff id not found: " + staff.getId()));

        String username = staff.getUsername() == null ? existing.getUsername() : staff.getUsername().trim();
        if (username.isEmpty()) {
            throw new IllegalArgumentException("Staff username is required");
        }
        if (staffRepository.countByUsernameNormalizedExceptId(staff.getId(), username) > 0) {
            throw new IllegalArgumentException("Staff username already exists: " + username);
        }
        staff.setUsername(username);
        validateDepartmentAndPosition(staff.getDeptId(), staff.getPositionId());

        if (staff.getCreatedAt() == null) {
            staff.setCreatedAt(existing.getCreatedAt());
        }
        if (staff.getPasswordHash() == null || staff.getPasswordHash().trim().isEmpty()) {
            staff.setPasswordHash(existing.getPasswordHash());
        } else {
            String inputPassword = staff.getPasswordHash().trim();
            if (!(PasswordHashUtil.isBcryptHash(inputPassword) || inputPassword.matches("^[a-fA-F0-9]{64}$"))) {
                staff.setPasswordHash(PasswordHashUtil.hashNew(inputPassword));
            }
        }
        if (staff.getStatusCode() == null || staff.getStatusCode().trim().isEmpty()) {
            staff.setStatusCode(existing.getStatusCode());
        }
        if (staff.getStatus() == null) {
            staff.setStatus(existing.getStatus());
        }
        if (file != null && !file.isEmpty()) {
            String staffId = username;
            staff.setPhotoKey(uploadProfileImage(staffId, file));
        } else if (staff.getPhotoKey() == null) {
            staff.setPhotoKey(existing.getPhotoKey());
        }
        staff.setUpdatedAt(new Date());
        staffRepository.save(staff);
    }

    @Override
    public StaffEntity selectMyDetail(String username) {
        StaffEntity staff = staffRepository
                .findByUsernameNormalized(username)
                .orElseThrow(() -> new IllegalArgumentException("Staff username not found: " + username));
        staff.setPhotoUrl(staffStorageService.getPresignedUrl(staff.getPhotoKey()));
        return staff;
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_STAFF_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_STAFF_DETAIL, allEntries = true)
    })
    public StaffEntity updateMyProfile(String username, StaffSelfUpdateReq req) {
        StaffEntity staff = staffRepository
                .findByUsernameNormalized(username)
                .orElseThrow(() -> new IllegalArgumentException("Staff username not found: " + username));

        if (req.getFullName() != null) {
            staff.setFullName(req.getFullName().trim());
        }
        if (req.getPhone() != null) {
            staff.setPhone(req.getPhone().trim());
        }
        if (req.getOfficeLocation() != null) {
            staff.setOfficeLocation(req.getOfficeLocation().trim());
        }
        if (req.getBio() != null) {
            staff.setBio(req.getBio().trim());
        }

        staff.setUpdatedAt(new Date());
        StaffEntity saved = staffRepository.save(staff);
        saved.setPhotoUrl(staffStorageService.getPresignedUrl(saved.getPhotoKey()));
        return saved;
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_STAFF_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_STAFF_DETAIL, allEntries = true)
    })
    public StaffEntity updateMyPhoto(String username, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("프로필 사진 파일을 선택해주세요.");
        }

        StaffEntity staff = staffRepository
                .findByUsernameNormalized(username)
                .orElseThrow(() -> new IllegalArgumentException("Staff username not found: " + username));

        staff.setPhotoKey(uploadProfileImage(staff.getUsername(), file));
        staff.setUpdatedAt(new Date());
        StaffEntity saved = staffRepository.save(staff);
        saved.setPhotoUrl(staffStorageService.getPresignedUrl(saved.getPhotoKey()));
        return saved;
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_STAFF_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_STAFF_DETAIL, key = "'detail:' + #id")
    })
    public StaffEntity updateStaffStatus(int id, String statusCode, String reason, String changedBy) {
        StaffEntity staff = staffRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff id not found: " + id));

        String nextStatus = statusCode == null ? "" : statusCode.trim().toUpperCase();
        if (nextStatus.isEmpty()) {
            throw new IllegalArgumentException("statusCode is required");
        }

        String prevStatus = staff.getStatusCode();
        if (!Objects.equals(prevStatus, nextStatus)) {
            staff.setStatusCode(nextStatus);
            if ("PENDING_APPROVAL".equalsIgnoreCase(staff.getStatus())) {
                staff.setStatus(nextStatus);
            }
            staff.setUpdatedAt(new Date());
            StaffEntity saved = staffRepository.save(staff);

            saveHistory(
                    id,
                    "STATUS_CHANGE",
                    "STATUS_CODE",
                    prevStatus,
                    nextStatus,
                    reason,
                    changedBy
            );
            return saved;
        }

        return staff;
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_STAFF_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_STAFF_DETAIL, key = "'detail:' + #id")
    })
    public StaffEntity updateStaffAssignment(int id, Long deptId, Long positionId, String reason, String changedBy) {
        StaffEntity staff = staffRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff id not found: " + id));

        validateDepartmentAndPosition(deptId, positionId);

        Long prevDeptId = staff.getDeptId();
        Long prevPositionId = staff.getPositionId();

        staff.setDeptId(deptId);
        staff.setPositionId(positionId);
        staff.setUpdatedAt(new Date());
        StaffEntity saved = staffRepository.save(staff);

        if (!Objects.equals(prevDeptId, deptId)) {
            saveHistory(id, "ASSIGNMENT_CHANGE", "DEPT_ID", valueOf(prevDeptId), valueOf(deptId), reason, changedBy);
        }
        if (!Objects.equals(prevPositionId, positionId)) {
            saveHistory(id, "ASSIGNMENT_CHANGE", "POSITION_ID", valueOf(prevPositionId), valueOf(positionId), reason, changedBy);
        }

        return saved;
    }

    @Override
    public List<StaffHistoryItemRes> getStaffHistory(int staffId) {
        try {
            return staffHistoryRepository.findByStaffIdOrderByChangedAtDescIdDesc(staffId)
                    .stream()
                    .map(h -> new StaffHistoryItemRes(
                            h.getId(),
                            h.getStaffId(),
                            h.getEventType(),
                            h.getFieldName(),
                            h.getOldValue(),
                            h.getNewValue(),
                            h.getReason(),
                            h.getChangedBy(),
                            h.getChangedAt()
                    ))
                    .collect(Collectors.toCollection(ArrayList::new));
        } catch (DataAccessException ex) {
            log.warn("Staff history table is not ready yet. returning empty list", ex);
            return new ArrayList<>();
        }
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_STAFF_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_STAFF_DETAIL, allEntries = true)
    })
    public void changeMyPassword(String username, String currentPassword, String newPassword) {
        StaffEntity staff = staffRepository
                .findByUsernameNormalized(username)
                .orElseThrow(() -> new IllegalArgumentException("Staff username not found: " + username));

        if (!PasswordHashUtil.matches(currentPassword, staff.getPasswordHash())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        if (currentPassword != null && currentPassword.equals(newPassword)) {
            throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        validateNewPassword(newPassword);
        staff.setPasswordHash(PasswordHashUtil.hashNew(newPassword));
        staff.setUpdatedAt(new Date());
        staffRepository.save(staff);
        saveHistory(staff.getId(), "PASSWORD_CHANGE", "PASSWORD_HASH", null, "UPDATED", "Self change", username);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_STAFF_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_STAFF_DETAIL, allEntries = true)
    })
    public void resetStaffPassword(int staffId, String newPassword, String changedBy) {
        StaffEntity staff = staffRepository
                .findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff id not found: " + staffId));

        validateNewPassword(newPassword);
        staff.setPasswordHash(PasswordHashUtil.hashNew(newPassword));
        staff.setUpdatedAt(new Date());
        staffRepository.save(staff);
        saveHistory(staffId, "PASSWORD_CHANGE", "PASSWORD_HASH", null, "UPDATED", "Admin reset", changedBy);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_STAFF_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_STAFF_DETAIL, allEntries = true)
    })
    public void resetStaffPasswordByHash(int staffId, String passwordHash, String changedBy) {
        StaffEntity staff = staffRepository
                .findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff id not found: " + staffId));

        if (passwordHash == null || passwordHash.trim().isEmpty()) {
            throw new IllegalArgumentException("passwordHash is required");
        }
        staff.setPasswordHash(passwordHash.trim());
        staff.setUpdatedAt(new Date());
        staffRepository.save(staff);
        saveHistory(staffId, "PASSWORD_CHANGE", "PASSWORD_HASH", null, "UPDATED", "Admin reset approved", changedBy);
    }

    private StaffListItem toListItem(StaffRepository.StaffListView view) {
        StaffListItem item = new StaffListItem();
        item.setId(view.getId());
        item.setUsername(view.getUsername());
        item.setStatusCode(view.getStatusCode());
        item.setStatus(view.getStatus());
        item.setDomainRole(view.getDomainRole());
        item.setFullName(view.getFullName());
        item.setOfficeLocation(view.getOfficeLocation());
        item.setPhotoKey(view.getPhotoKey());
        item.setBio(view.getBio());
        item.setPhone(view.getPhone());
        item.setDeptId(view.getDeptId());
        item.setPositionId(view.getPositionId());
        item.setDepartmentName(view.getDepartmentName());
        item.setPositionName(view.getPositionName());
        item.setPhotoUrl(staffStorageService.getPresignedUrl(view.getPhotoKey()));
        return item;
    }

    private String uploadProfileImage(String staffId, MultipartFile file) {
        String normalizedStaffId = staffId == null ? "unknown" : staffId.trim();
        String safeStaffId = normalizedStaffId.isEmpty()
                ? "unknown"
                : normalizedStaffId.replaceAll("[^A-Za-z0-9._-]", "_");
        String name = file.getOriginalFilename();
        String safeName = name == null ? "image" : name.replaceAll("[^A-Za-z0-9._-]", "_");
        String objectKey = String.format("staff-profile/%s/%s_%s", safeStaffId, UUID.randomUUID(), safeName);
        return staffStorageService.uploadProfileImage(objectKey, file);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_STAFF_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_STAFF_DETAIL, key = "'detail:' + #id")
    })
    public void deleteStaff(int id) {
        StaffEntity staff = staffRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff id not found: " + id));

        // soft delete policy: mark status_code as RESIGNED
        String prevStatus = staff.getStatusCode();
        staff.setStatusCode("RESIGNED");
        staff.setUpdatedAt(new Date());
        staffRepository.save(staff);

        saveHistory(id, "STATUS_CHANGE", "STATUS_CODE", valueOf(prevStatus), "RESIGNED", "Soft delete", "system");
    }

    private void validateDepartmentAndPosition(Long deptId, Long positionId) {
        if (deptId != null) {
            DepartmentsEntity dept = departmentRepository.findById(deptId)
                    .orElseThrow(() -> new IllegalArgumentException("Department id not found: " + deptId));
            if (!"Y".equalsIgnoreCase(dept.getIsActive())) {
                throw new IllegalArgumentException("Inactive department cannot be assigned: " + deptId);
            }
        }
        if (positionId != null) {
            PositionsEntity position = positionRepository.findById(positionId)
                    .orElseThrow(() -> new IllegalArgumentException("Position id not found: " + positionId));
            if (!"Y".equalsIgnoreCase(position.getIsActive())) {
                throw new IllegalArgumentException("Inactive position cannot be assigned: " + positionId);
            }
        }
    }

    private void saveHistory(int staffId,
                             String eventType,
                             String fieldName,
                             String oldValue,
                             String newValue,
                             String reason,
                             String changedBy) {
        StaffHistoryEntity history = new StaffHistoryEntity();
        history.setStaffId(staffId);
        history.setEventType(eventType);
        history.setFieldName(fieldName);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        history.setReason(reason);
        history.setChangedBy(changedBy);
        history.setChangedAt(new Date());
        try {
            staffHistoryRepository.save(history);
        } catch (DataAccessException ex) {
            log.warn("Failed to save staff history. skipped", ex);
        }
    }

    private String valueOf(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String nullToBlank(String value) {
        return value == null ? "" : value;
    }

    private void validateNewPassword(String newPassword) {
        String value = nullToBlank(newPassword).trim();
        if (value.length() < 8) {
            throw new IllegalArgumentException("새 비밀번호는 8자 이상이어야 합니다.");
        }
    }
}

