package app.patient.service.impl;

import app.patient.dto.ConsentCreateReqDTO;
import app.patient.dto.ConsentLatestResDTO;
import app.patient.dto.ConsentResDTO;
import app.patient.dto.ConsentUpdateReqDTO;
import app.patient.dto.ConsentWithdrawHistoryResDTO;
import app.patient.entity.ConsentEntity;
import app.patient.entity.ConsentWithdrawHistoryEntity;
import app.patient.exception.ConsentNotFoundException;
import app.patient.mapper.ConsentMapper;
import app.patient.mapstruct.ConsentReqMapStruct;
import app.patient.mapstruct.ConsentResMapStruct;
import app.patient.repository.ConsentRepository;
import app.patient.repository.ConsentWithdrawHistoryRepository;
import app.patient.service.ConsentService;
import app.patient.storage.PatientStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import app.patient.service.CodeValidationService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ConsentServiceImpl implements ConsentService {

    private static final String GROUP_CONSENT_TYPE = "CONSENT_TYPE";

    private final ConsentRepository consentRepository;
    private final ConsentMapper consentMapper;
    private final ConsentReqMapStruct consentReqMapStruct;
    private final ConsentResMapStruct consentResMapStruct;
    private final PatientStorageService patientStorageService;
    private final ConsentWithdrawHistoryRepository consentWithdrawHistoryRepository;
    private final CodeValidationService codeValidationService;

    @Override
    public List<ConsentResDTO> findList(Long patientId) {
        log.info("Service: consent list, patientId={}", patientId);
        List<ConsentEntity> entities = consentRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        return consentResMapStruct.toDTOList(entities);
    }

    @Override
    @Cacheable(value = "CONSENT", key = "#consentId")
    public ConsentResDTO findDetail(Long patientId, Long consentId) {
        log.info("Service: consent detail, patientId={}, consentId={}", patientId, consentId);
        ConsentEntity entity = consentRepository.findByConsentIdAndPatientId(consentId, patientId)
                .orElseThrow(() -> new ConsentNotFoundException(consentId));
        return consentResMapStruct.toDTO(entity);
    }

    @Override
    @Transactional
    public ConsentResDTO register(Long patientId, ConsentCreateReqDTO createReqDTO, MultipartFile file) {
        log.info("Service: consent create, patientId={}", patientId);
        codeValidationService.validateActiveCode(
                GROUP_CONSENT_TYPE,
                createReqDTO.getConsentType(),
                "consentType"
        );

        ConsentEntity entity = consentReqMapStruct.toEntity(createReqDTO);
        if (createReqDTO.getPatientId() != null && !patientId.equals(createReqDTO.getPatientId())) {
            throw new IllegalArgumentException("patientId does not match.");
        }
        entity.setPatientId(patientId);
        entity.setActiveYn(Boolean.TRUE);
        entity.setAgreedAt(LocalDateTime.now());

        if (file != null && !file.isEmpty()) {
            String fileUrl = patientStorageService.save(file, "consent");
            entity.setFileUrl(fileUrl);
        }

        ConsentEntity saved = consentRepository.save(entity);
        return consentResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "CONSENT", key = "#consentId")
    public ConsentResDTO modify(Long patientId, Long consentId, ConsentUpdateReqDTO updateReqDTO, MultipartFile file) {
        log.info("Service: consent update, patientId={}, consentId={}", patientId, consentId);

        ConsentEntity saved = consentRepository.findByConsentIdAndPatientId(consentId, patientId)
                .orElseThrow(() -> new ConsentNotFoundException(consentId));

        boolean wasActive = Boolean.TRUE.equals(saved.getActiveYn());
        LocalDateTime beforeWithdrawnAt = saved.getWithdrawnAt();

        if (updateReqDTO.getActiveYn() != null) {
            boolean nextActive = updateReqDTO.getActiveYn();
            saved.setActiveYn(nextActive);
            if (!nextActive && saved.getWithdrawnAt() == null) {
                saved.setWithdrawnAt(LocalDateTime.now());
            }
            if (nextActive) {
                saved.setWithdrawnAt(null);
            }
        }
        if (updateReqDTO.getFileUrl() != null) saved.setFileUrl(updateReqDTO.getFileUrl());
        if (updateReqDTO.getNote() != null) saved.setNote(updateReqDTO.getNote());
        if (updateReqDTO.getAgreedAt() != null) saved.setAgreedAt(updateReqDTO.getAgreedAt());
        if (updateReqDTO.getWithdrawnAt() != null) saved.setWithdrawnAt(updateReqDTO.getWithdrawnAt());

        if (file != null && !file.isEmpty()) {
            String fileUrl = patientStorageService.save(file, "consent");
            saved.setFileUrl(fileUrl);
        }

        if (wasActive && Boolean.FALSE.equals(saved.getActiveYn())) {
            logWithdrawHistory(saved, saved.getWithdrawnAt());
        } else if (beforeWithdrawnAt == null && saved.getWithdrawnAt() != null) {
            logWithdrawHistory(saved, saved.getWithdrawnAt());
        }

        return consentResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "CONSENT", key = "#consentId")
    public void remove(Long patientId, Long consentId) {
        log.info("Service: consent delete, patientId={}, consentId={}", patientId, consentId);

        ConsentEntity saved = consentRepository.findByConsentIdAndPatientId(consentId, patientId)
                .orElseThrow(() -> new ConsentNotFoundException(consentId));

        if (Boolean.TRUE.equals(saved.getActiveYn()) || saved.getWithdrawnAt() == null) {
            logWithdrawHistory(saved, saved.getWithdrawnAt() != null
                    ? saved.getWithdrawnAt()
                    : LocalDateTime.now()
            );
        }
        consentRepository.deleteById(consentId);
    }

    @Override
    public List<ConsentResDTO> search(Long patientId, String type, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("keyword is required");
        }

        List<ConsentEntity> entities = consentMapper.search(type, keyword.trim());
        return consentResMapStruct.toDTOList(
                entities.stream()
                        .filter(e -> patientId.equals(e.getPatientId()))
                        .collect(Collectors.toList())
        );
    }

    @Override
    public List<ConsentLatestResDTO> findLatestByPatient(Long patientId) {
        List<ConsentEntity> entities = consentRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        Map<String, ConsentEntity> latestByType = entities.stream()
                .filter(e -> e.getConsentType() != null)
                .collect(Collectors.toMap(
                        ConsentEntity::getConsentType,
                        e -> e,
                        (a, b) -> compareLatest(a, b) >= 0 ? a : b
                ));

        return latestByType.values().stream()
                .sorted(Comparator.comparing(ConsentEntity::getConsentType))
                .map(e -> new ConsentLatestResDTO(
                        e.getConsentId(),
                        e.getConsentType(),
                        e.getActiveYn(),
                        e.getAgreedAt(),
                        e.getWithdrawnAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<ConsentWithdrawHistoryResDTO> findWithdrawHistory(Long patientId) {
        return consentWithdrawHistoryRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(e -> new ConsentWithdrawHistoryResDTO(
                        e.getHistoryId(),
                        e.getConsentId(),
                        e.getConsentType(),
                        e.getWithdrawnAt(),
                        e.getChangedBy(),
                        e.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    private int compareLatest(ConsentEntity a, ConsentEntity b) {
        LocalDateTime aTime = a.getAgreedAt() != null ? a.getAgreedAt() : a.getCreatedAt();
        LocalDateTime bTime = b.getAgreedAt() != null ? b.getAgreedAt() : b.getCreatedAt();
        if (aTime == null && bTime == null) return 0;
        if (aTime == null) return -1;
        if (bTime == null) return 1;
        return aTime.compareTo(bTime);
    }

    private void logWithdrawHistory(ConsentEntity consent, LocalDateTime withdrawnAt) {
        if (consent == null) return;
        ConsentWithdrawHistoryEntity history = new ConsentWithdrawHistoryEntity();
        history.setConsentId(consent.getConsentId());
        history.setPatientId(consent.getPatientId());
        history.setConsentType(consent.getConsentType());
        history.setWithdrawnAt(withdrawnAt != null ? withdrawnAt : LocalDateTime.now());
        history.setChangedBy(null);
        consentWithdrawHistoryRepository.save(history);
    }
}

