package app.staff.service;

import app.staff.dto.StaffCredentialDTO;
import app.staff.entity.StaffCredentialEntity;
import app.staff.repository.StaffCredentialRepository;
import app.staff.storage.StaffStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StaffCredentialServiceImpl implements StaffCredentialService {

    private static final String CACHE_CREDENTIAL_LIST = "CREDENTIAL_LIST";
    private static final String CACHE_CREDENTIAL_DETAIL = "CREDENTIAL_DETAIL";
    private static final String CACHE_EXPIRING_SOON = "CREDENTIAL_EXPIRING_SOON";
    private static final String CACHE_EXPIRED = "CREDENTIAL_EXPIRED";

    private static final Set<String> VALID_CRED_TYPES = Set.of("LICENSE", "CERT");
    private static final Set<String> VALID_STATUSES = Set.of("ACTIVE", "EXPIRED", "REVOKED");

    @Autowired
    private StaffCredentialRepository credentialRepository;

    @Autowired
    private StaffStorageService staffStorageService;

    @Override
    public void createCredential(StaffCredentialEntity credential, MultipartFile file) {
        if (!Objects.nonNull(credential.getStaffId())) {
            throw new IllegalArgumentException("Staff ID is required");
        }
        if (credential.getName() == null || credential.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Credential name is required");
        }
        if (credential.getCredType() == null || credential.getCredType().trim().isEmpty()) {
            throw new IllegalArgumentException("Credential type is required");
        }

        credential.setName(credential.getName().trim());
        String credType = credential.getCredType().trim().toUpperCase();
        validateCredType(credType);
        credential.setCredType(credType);

        // Set default status if not provided
        String status = credential.getStatus();
        if (status == null || status.trim().isEmpty()) {
            status = "ACTIVE";
        } else {
            status = status.trim().toUpperCase();
            validateStatus(status);
        }
        credential.setStatus(status);

        // Handle evidence file upload
        if (file != null && !file.isEmpty()) {
            String objectKey = uploadEvidenceFile(credential.getStaffId(), credential.getCredType(), file);
            credential.setEvidenceKey(objectKey);
        }

        // Set timestamps
        if (credential.getCreatedAt() == null) {
            credential.setCreatedAt(new Date());
        }
        credential.setUpdatedAt(new Date());

        credentialRepository.save(credential);
    }

    @Override
    @Cacheable(cacheNames = CACHE_CREDENTIAL_LIST, key = "'list:' + #staffId + ':' + #credType + ':' + #status")
    public List<StaffCredentialDTO> getCredentials(Integer staffId, String credType, String status) {
        if (staffId == null) {
            throw new IllegalArgumentException("Staff ID is required");
        }
        return credentialRepository.findCredentialList(staffId, credType, status)
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffCredentialDTO> searchCredentials(Integer staffId, String credType, String status, String keyword) {
        if (staffId == null) {
            throw new IllegalArgumentException("Staff ID is required");
        }
        String normalizedKeyword = keyword == null ? "" : keyword;
        return credentialRepository.searchCredentialsByName(staffId, credType, status, normalizedKeyword)
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(cacheNames = CACHE_CREDENTIAL_DETAIL, key = "'detail:' + #id")
    public StaffCredentialEntity getCredentialDetail(Integer id) {
        StaffCredentialEntity credential = credentialRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Credential id not found: " + id));
        return credential;
    }

    @Override
    @Cacheable(cacheNames = CACHE_EXPIRING_SOON, key = "'expiring:' + #daysBefore")
    public List<StaffCredentialDTO> getExpiringSoon(int daysBefore) {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, daysBefore);
        Date endDate = calendar.getTime();

        Date startDate = new Date();

        return credentialRepository.findExpiringSoon(startDate, endDate)
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(cacheNames = CACHE_EXPIRED)
    public List<StaffCredentialDTO> getExpired() {
        return credentialRepository.findExpired(new Date())
                .stream()
                .map(this::toListItem)
                .collect(Collectors.toList());
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_CREDENTIAL_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_CREDENTIAL_DETAIL, key = "'detail:' + #id"),
            @CacheEvict(cacheNames = CACHE_EXPIRING_SOON, allEntries = true),
            @CacheEvict(cacheNames = CACHE_EXPIRED, allEntries = true)
    })
    public void updateCredential(Integer id, StaffCredentialEntity credential, MultipartFile file) {
        StaffCredentialEntity existing = credentialRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Credential id not found: " + id));

        // Update fields
        if (credential.getName() != null && !credential.getName().trim().isEmpty()) {
            existing.setName(credential.getName().trim());
        }
        if (credential.getCredType() != null && !credential.getCredType().trim().isEmpty()) {
            String credType = credential.getCredType().trim().toUpperCase();
            validateCredType(credType);
            existing.setCredType(credType);
        }
        if (credential.getCredNumber() != null) {
            existing.setCredNumber(credential.getCredNumber());
        }
        if (credential.getIssuer() != null) {
            existing.setIssuer(credential.getIssuer());
        }
        if (credential.getIssuedAt() != null) {
            existing.setIssuedAt(credential.getIssuedAt());
        }
        if (credential.getExpiresAt() != null) {
            existing.setExpiresAt(credential.getExpiresAt());
        }
        if (credential.getStatus() != null && !credential.getStatus().trim().isEmpty()) {
            String status = credential.getStatus().trim().toUpperCase();
            validateStatus(status);
            existing.setStatus(status);
        }

        // Handle evidence file upload
        if (file != null && !file.isEmpty()) {
            String objectKey = uploadEvidenceFile(existing.getStaffId(), existing.getCredType(), file);
            existing.setEvidenceKey(objectKey);
        }

        existing.setUpdatedAt(new Date());
        credentialRepository.save(existing);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_CREDENTIAL_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_CREDENTIAL_DETAIL, key = "'detail:' + #id"),
            @CacheEvict(cacheNames = CACHE_EXPIRING_SOON, allEntries = true),
            @CacheEvict(cacheNames = CACHE_EXPIRED, allEntries = true)
    })
    public void deleteCredential(Integer id) {
        StaffCredentialEntity credential = credentialRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Credential id not found: " + id));

        credential.setStatus("REVOKED");
        credential.setUpdatedAt(new Date());
        credentialRepository.save(credential);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_CREDENTIAL_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_CREDENTIAL_DETAIL, key = "'detail:' + #id"),
            @CacheEvict(cacheNames = CACHE_EXPIRING_SOON, allEntries = true),
            @CacheEvict(cacheNames = CACHE_EXPIRED, allEntries = true)
    })
    public void updateCredentialStatus(Integer id, String status) {
        StaffCredentialEntity credential = credentialRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Credential id not found: " + id));

        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();
        validateStatus(normalizedStatus);
        credential.setStatus(normalizedStatus);
        credential.setUpdatedAt(new Date());
        credentialRepository.save(credential);
    }

    private StaffCredentialDTO toListItem(StaffCredentialRepository.CredentialListView view) {
        StaffCredentialDTO item = new StaffCredentialDTO();
        item.setId(view.getId());
        item.setStaffId(view.getStaffId());
        item.setCredType(view.getCredType());
        item.setName(view.getName());
        item.setCredNumber(view.getCredNumber());
        item.setIssuer(view.getIssuer());
        item.setIssuedAt(view.getIssuedAt());
        item.setExpiresAt(view.getExpiresAt());
        item.setStatus(view.getStatus());
        item.setEvidenceKey(view.getEvidenceKey());
        item.setEvidenceUrl(staffStorageService.getPresignedUrl(view.getEvidenceKey()));
        return item;
    }

    private StaffCredentialDTO toListItem(StaffCredentialEntity entity) {
        StaffCredentialDTO item = new StaffCredentialDTO();
        item.setId(entity.getId());
        item.setStaffId(entity.getStaffId());
        item.setCredType(entity.getCredType());
        item.setName(entity.getName());
        item.setCredNumber(entity.getCredNumber());
        item.setIssuer(entity.getIssuer());
        item.setIssuedAt(entity.getIssuedAt());
        item.setExpiresAt(entity.getExpiresAt());
        item.setStatus(entity.getStatus());
        item.setEvidenceKey(entity.getEvidenceKey());
        item.setEvidenceUrl(staffStorageService.getPresignedUrl(entity.getEvidenceKey()));
        return item;
    }

    private String uploadEvidenceFile(Integer staffId, String credType, MultipartFile file) {
        String safeStaffId = staffId == null ? "unknown" : staffId.toString();
        String safeCredType = credType == null ? "credential" : credType.trim().replaceAll("[^A-Za-z0-9._-]", "_");
        String name = file.getOriginalFilename();
        String safeName = name == null ? "evidence" : name.replaceAll("[^A-Za-z0-9._-]", "_");

        String objectKey = String.format("staff-credential/%s/%s/%s_%s", safeStaffId, safeCredType, UUID.randomUUID(), safeName);
        return staffStorageService.uploadProfileImage(objectKey, file);
    }

    private void validateCredType(String credType) {
        if (!VALID_CRED_TYPES.contains(credType)) {
            throw new IllegalArgumentException(
                "Invalid credential type: " + credType + ". Valid types are: " + VALID_CRED_TYPES
            );
        }
    }

    private void validateStatus(String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException(
                "Invalid status: " + status + ". Valid statuses are: " + VALID_STATUSES
            );
        }
    }

    @Scheduled(cron = "0 0 1 * * ?")
    @Caching(evict = {
            @CacheEvict(cacheNames = CACHE_CREDENTIAL_LIST, allEntries = true),
            @CacheEvict(cacheNames = CACHE_CREDENTIAL_DETAIL, allEntries = true),
            @CacheEvict(cacheNames = CACHE_EXPIRING_SOON, allEntries = true),
            @CacheEvict(cacheNames = CACHE_EXPIRED, allEntries = true)
    })
    public void autoUpdateExpiredCredentials() {
        List<StaffCredentialEntity> expiredCredentials = credentialRepository.findExpired(new Date());

        for (StaffCredentialEntity credential : expiredCredentials) {
            if ("ACTIVE".equals(credential.getStatus())) {
                credential.setStatus("EXPIRED");
                credential.setUpdatedAt(new Date());
                credentialRepository.save(credential);
            }
        }
    }
}
