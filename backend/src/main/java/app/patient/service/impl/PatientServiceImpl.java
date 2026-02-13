package app.patient.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import app.patient.storage.PatientStorageService;
import app.patient.dto.CreateReqDTO;
import app.patient.dto.PatientResDTO;
import app.patient.dto.StatusChangeReqDTO;
import app.patient.dto.UpdateReqDTO;
import app.patient.entity.PatientInfoHistoryEntity;
import app.patient.entity.PatientEntity;
import app.patient.exception.PatientNotFoundException;
import app.patient.mapper.PatientMapper;
import app.patient.mapstruct.PatientReqMapStruct;
import app.patient.mapstruct.PatientResMapStruct;
import app.patient.repository.PatientInfoHistoryRepository;
import app.patient.repository.PatientRepository;
import app.patient.service.PatientService;
import app.patient.service.CodeValidationService;
import app.patient.entity.PatientStatusHistoryEntity;
import app.patient.repository.PatientStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PatientServiceImpl implements PatientService {
    private static final String GROUP_PATIENT_STATUS = "PATIENT_STATUS";


    private final PatientRepository patientRepository;
    private final PatientStatusHistoryRepository patientStatusHistoryRepository;
    private final PatientInfoHistoryRepository patientInfoHistoryRepository;
    private final ObjectMapper objectMapper;
    private final PatientMapper patientMapper;
    private final PatientReqMapStruct patientReqMapStruct;
    private final PatientResMapStruct patientResMapStruct;
    private final PatientStorageService patientStorageService;
    private final CodeValidationService codeValidationService;

    @Override
    public List<PatientResDTO> findList() {
        log.info("Patient list");
        List<PatientEntity> entities = patientRepository.findAllByStatusCodeNot("INACTIVE");
        return patientResMapStruct.toDTOList(entities);
    }

    @Override
    public PatientResDTO findDetail(Long id) {
        log.info("Patient detail id={}", id);

        PatientEntity entity = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException(id));

        return patientResMapStruct.toDTO(entity);
    }

    @Override
    @Transactional
    public PatientResDTO register(CreateReqDTO createreqDTO, MultipartFile file) {
        log.info("Register patient: {}", createreqDTO);

        PatientEntity entity = patientReqMapStruct.toEntity(createreqDTO);

        if (entity.getPatientNo() == null || entity.getPatientNo().isBlank()) {
            entity.setPatientNo(genPatientNo());
        }

        entity.setStatusCode("ACTIVE");
        entity.setIsVip(Boolean.FALSE);

        if (entity.getIsForeigner() == null) {
            entity.setIsForeigner(Boolean.FALSE);
        }
        if (entity.getContactPriority() == null || entity.getContactPriority().isBlank()) {
            entity.setContactPriority("PATIENT");
        }

        if (file != null && !file.isEmpty()) {
            String photoUrl = patientStorageService.save(file, "patients");
            entity.setPhotoUrl(photoUrl);
        }

        PatientEntity saved = patientRepository.save(entity);
        logInfoHistory("CREATE", null, saved, "system");
        logStatusHistory(saved.getPatientId(), "NEW", "ACTIVE", "Created", null);

        return patientResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT", key = "#id")
    public PatientResDTO modify(Long id, UpdateReqDTO updatereqDTO) {
        log.info("Modify patient id={}", id);

        PatientEntity saved = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException(id));

        PatientEntity before = snapshot(saved);

        saved.setName(updatereqDTO.getName());
        saved.setEmail(updatereqDTO.getEmail());
        saved.setPhone(updatereqDTO.getPhone());
        saved.setGender(updatereqDTO.getGender());
        saved.setBirthDate(updatereqDTO.getBirthDate());
        saved.setAddress(updatereqDTO.getAddress());
        saved.setAddressDetail(updatereqDTO.getAddressDetail());

        saved.setGuardianName(updatereqDTO.getGuardianName());
        saved.setGuardianPhone(updatereqDTO.getGuardianPhone());
        saved.setGuardianRelation(updatereqDTO.getGuardianRelation());
        saved.setIsForeigner(updatereqDTO.getIsForeigner());
        saved.setContactPriority(updatereqDTO.getContactPriority());
        saved.setNote(updatereqDTO.getNote());

        logInfoHistory("UPDATE", before, saved, "system");
        return patientResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT", key = "#id")
    public void remove(Long id) {
        log.info("Deactivate patient id={}", id);

        PatientEntity entity = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException(id));
        String before = entity.getStatusCode();
        entity.setStatusCode("INACTIVE");
        if (!"INACTIVE".equals(before)) {
            logStatusHistory(entity.getPatientId(), before, "INACTIVE", "Deactivated", null);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT", key = "#id")
    public PatientResDTO changeStatus(Long id, StatusChangeReqDTO statusChangeReqDTO) {
        log.info("Change status id={}", id);

        PatientEntity entity = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException(id));

        String before = entity.getStatusCode();
        String after = statusChangeReqDTO.getStatusCode();
        codeValidationService.validateActiveCode(GROUP_PATIENT_STATUS, after, "statusCode");

        entity.setStatusCode(after);
        if (!after.equals(before)) {
            logStatusHistory(
                    entity.getPatientId(),
                    before,
                    after,
                    statusChangeReqDTO.getReason(),
                    statusChangeReqDTO.getChangedBy()
            );
        }

        return patientResMapStruct.toDTO(entity);
    }

    @Override
    public List<PatientResDTO> search(String type, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("keyword is required");
        }

        List<PatientEntity> entities = patientMapper.search(type, keyword.trim());
        return patientResMapStruct.toDTOList(entities);
    }
    @Override
    public List<PatientResDTO> searchMulti(String name, String birthDate, String phone) {
        if ((name == null || name.isBlank())
                && (birthDate == null || birthDate.isBlank())
                && (phone == null || phone.isBlank())) {
            throw new IllegalArgumentException("At least one search field is required");
        }
        List<PatientEntity> entities = patientMapper.searchMulti(
                name == null ? null : name.trim(),
                birthDate == null ? null : birthDate.trim(),
                phone == null ? null : phone.trim()
        );
        return patientResMapStruct.toDTOList(entities);
    }

    private void logStatusHistory(
            Long patientId,
            String fromStatus,
            String toStatus,
            String reason,
            String changedBy
    ) {
        PatientStatusHistoryEntity history = new PatientStatusHistoryEntity();
        history.setPatientId(patientId);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setReason(reason);
        history.setChangedBy(changedBy);
        patientStatusHistoryRepository.save(history);
    }

    private PatientEntity snapshot(PatientEntity src) {
        PatientEntity copy = new PatientEntity();
        copy.setPatientId(src.getPatientId());
        copy.setPatientNo(src.getPatientNo());
        copy.setName(src.getName());
        copy.setGender(src.getGender());
        copy.setBirthDate(src.getBirthDate());
        copy.setPhone(src.getPhone());
        copy.setEmail(src.getEmail());
        copy.setAddress(src.getAddress());
        copy.setAddressDetail(src.getAddressDetail());
        copy.setGuardianName(src.getGuardianName());
        copy.setGuardianPhone(src.getGuardianPhone());
        copy.setGuardianRelation(src.getGuardianRelation());
        copy.setIsForeigner(src.getIsForeigner());
        copy.setContactPriority(src.getContactPriority());
        copy.setNote(src.getNote());
        copy.setStatusCode(src.getStatusCode());
        copy.setIsVip(src.getIsVip());
        copy.setPhotoUrl(src.getPhotoUrl());
        copy.setCreatedAt(src.getCreatedAt());
        copy.setUpdatedAt(src.getUpdatedAt());
        return copy;
    }

    private void logInfoHistory(String changeType, PatientEntity before, PatientEntity after, String changedBy) {
        PatientEntity base = after != null ? after : before;
        if (base == null) {
            return;
        }

        PatientInfoHistoryEntity history = new PatientInfoHistoryEntity();
        history.setPatientId(base.getPatientId());
        history.setChangeType(changeType);
        history.setBeforeData(toJson(before));
        history.setAfterData(toJson(after));
        history.setChangedBy(changedBy);
        patientInfoHistoryRepository.save(history);
    }

    private String toJson(PatientEntity entity) {
        if (entity == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(entity);
        } catch (JsonProcessingException e) {
            log.warn("Patient info history JSON serialize failed", e);
            return null;
        }
    }

    private String genPatientNo() {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 4);
        return "P" + date + "-" + token;
    }
    @Override
    @Transactional
    @CacheEvict(value = "PATIENT", key = "#id")
    public PatientResDTO changeVip(Long id, Boolean isVip) {
        PatientEntity entity = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException(id));
        entity.setIsVip(Boolean.TRUE.equals(isVip));
        return patientResMapStruct.toDTO(entity);
    }
}


