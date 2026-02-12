package app.staff.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import app.staff.storage.StaffStorageService;
import app.staff.dto.StaffListItem;
import app.staff.entity.StaffEntity;
import app.staff.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;



@Service
public class StaffServiceImpl implements StaffService {

    private static final String CACHE_STAFF_LIST = "STAFF_LIST";
    private static final String CACHE_STAFF_DETAIL = "STAFF_DETAIL";

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private StaffStorageService staffStorageService;

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

        if (staff.getCreatedAt() == null) {
            staff.setCreatedAt(existing.getCreatedAt());
        }
        if (file != null && !file.isEmpty()) {
            String staffId = staff.getUsername() == null ? existing.getUsername() : staff.getUsername();
            staff.setPhotoKey(uploadProfileImage(staffId, file));
        } else if (staff.getPhotoKey() == null) {
            staff.setPhotoKey(existing.getPhotoKey());
        }
        staff.setUpdatedAt(new Date());
        staffRepository.save(staff);
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
        staff.setStatusCode("RESIGNED");
        staff.setUpdatedAt(new Date());
        staffRepository.save(staff);
    }
}

