package app.patient.service.impl;

import app.patient.dto.PatientRestrictionCreateReqDTO;
import app.patient.dto.PatientRestrictionResDTO;
import app.patient.dto.PatientRestrictionUpdateReqDTO;
import app.patient.entity.PatientRestrictionEntity;
import app.patient.exception.PatientRestrictionNotFoundException;
import app.patient.mapper.PatientRestrictionMapper;
import app.patient.mapstruct.PatientRestrictionReqMapStruct;
import app.patient.mapstruct.PatientRestrictionResMapStruct;
import app.patient.repository.PatientRestrictionRepository;
import app.patient.service.PatientRestrictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import app.patient.service.CodeValidationService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PatientRestrictionServiceImpl implements PatientRestrictionService {

    private static final String GROUP_PATIENT_RESTRICTION = "PATIENT_RESTRICTION";

    private final PatientRestrictionRepository patientRestrictionRepository;
    private final PatientRestrictionMapper patientRestrictionMapper;
    private final PatientRestrictionReqMapStruct patientRestrictionReqMapStruct;
    private final PatientRestrictionResMapStruct patientRestrictionResMapStruct;
    private final CodeValidationService codeValidationService;

    @Override
    public List<PatientRestrictionResDTO> findList() {
        log.info("Service: list patient restrictions");
        List<PatientRestrictionEntity> entities = patientRestrictionRepository.findAll();
        return patientRestrictionResMapStruct.toDTOList(entities);
    }

    @Override
    @Cacheable(value = "PATIENT_RESTRICTION", key = "#id")
    public PatientRestrictionResDTO findDetail(Long id) {
        log.info("Service: restriction detail, id={}", id);
        PatientRestrictionEntity entity = patientRestrictionRepository.findById(id)
                .orElseThrow(() -> new PatientRestrictionNotFoundException(id));
        return patientRestrictionResMapStruct.toDTO(entity);
    }

    @Override
    @Transactional
    public PatientRestrictionResDTO register(PatientRestrictionCreateReqDTO createReqDTO) {
        log.info("Service: create restriction");
        codeValidationService.validateActiveCode(
                GROUP_PATIENT_RESTRICTION,
                createReqDTO.getRestrictionType(),
                "restrictionType"
        );
        PatientRestrictionEntity entity = patientRestrictionReqMapStruct.toEntity(createReqDTO);
        if (entity.getActiveYn() == null) {
            entity.setActiveYn(Boolean.TRUE);
        }
        PatientRestrictionEntity saved = patientRestrictionRepository.save(entity);
        return patientRestrictionResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT_RESTRICTION", key = "#id")
    public PatientRestrictionResDTO modify(Long id, PatientRestrictionUpdateReqDTO updateReqDTO) {
        log.info("Service: update restriction, id={}", id);
        PatientRestrictionEntity saved = patientRestrictionRepository.findById(id)
                .orElseThrow(() -> new PatientRestrictionNotFoundException(id));

        if (updateReqDTO.getRestrictionType() != null) {
            codeValidationService.validateActiveCode(
                    GROUP_PATIENT_RESTRICTION,
                    updateReqDTO.getRestrictionType(),
                    "restrictionType"
            );
            saved.setRestrictionType(updateReqDTO.getRestrictionType());
        }
        if (updateReqDTO.getActiveYn() != null) saved.setActiveYn(updateReqDTO.getActiveYn());
        if (updateReqDTO.getReason() != null) saved.setReason(updateReqDTO.getReason());
        if (updateReqDTO.getEndAt() != null) saved.setEndAt(updateReqDTO.getEndAt());

        return patientRestrictionResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT_RESTRICTION", key = "#id")
    public void remove(Long id) {
        log.info("Service: delete restriction, id={}", id);
        if (!patientRestrictionRepository.existsById(id)) {
            throw new PatientRestrictionNotFoundException(id);
        }
        patientRestrictionRepository.deleteById(id);
    }

    @Override
    public List<PatientRestrictionResDTO> search(String type, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("keyword is required");
        }
        List<PatientRestrictionEntity> entities =
                patientRestrictionMapper.search(type, keyword.trim());
        return patientRestrictionResMapStruct.toDTOList(entities);
    }
}

