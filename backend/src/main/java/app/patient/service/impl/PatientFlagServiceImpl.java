package app.patient.service.impl;

import app.patient.dto.PatientFlagCreateReqDTO;
import app.patient.dto.PatientFlagResDTO;
import app.patient.dto.PatientFlagUpdateReqDTO;
import app.patient.entity.PatientFlagEntity;
import app.patient.exception.PatientFlagNotFoundException;
import app.patient.mapper.PatientFlagMapper;
import app.patient.mapstruct.PatientFlagReqMapStruct;
import app.patient.mapstruct.PatientFlagResMapStruct;
import app.patient.repository.PatientFlagRepository;
import app.patient.service.PatientFlagService;
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
public class PatientFlagServiceImpl implements PatientFlagService {

    private static final String GROUP_PATIENT_FLAG = "PATIENT_FLAG";

    private final PatientFlagRepository patientFlagRepository;
    private final PatientFlagMapper patientFlagMapper;
    private final PatientFlagReqMapStruct patientFlagReqMapStruct;
    private final PatientFlagResMapStruct patientFlagResMapStruct;
    private final CodeValidationService codeValidationService;

    @Override
    public List<PatientFlagResDTO> findList() {
        log.info("Service: list patient flags");
        List<PatientFlagEntity> entities = patientFlagRepository.findAll();
        return patientFlagResMapStruct.toDTOList(entities);
    }

    @Override
    @Cacheable(value = "PATIENT_FLAG", key = "#id")
    public PatientFlagResDTO findDetail(Long id) {
        log.info("Service: flag detail, id={}", id);
        PatientFlagEntity entity = patientFlagRepository.findById(id)
                .orElseThrow(() -> new PatientFlagNotFoundException(id));
        return patientFlagResMapStruct.toDTO(entity);
    }

    @Override
    @Transactional
    public PatientFlagResDTO register(PatientFlagCreateReqDTO createReqDTO) {
        log.info("Service: create flag");
        codeValidationService.validateActiveCode(
                GROUP_PATIENT_FLAG,
                createReqDTO.getFlagType(),
                "flagType"
        );
        PatientFlagEntity entity = patientFlagReqMapStruct.toEntity(createReqDTO);
        if (entity.getActiveYn() == null) {
            entity.setActiveYn(Boolean.TRUE);
        }
        PatientFlagEntity saved = patientFlagRepository.save(entity);
        return patientFlagResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT_FLAG", key = "#id")
    public PatientFlagResDTO modify(Long id, PatientFlagUpdateReqDTO updateReqDTO) {
        log.info("Service: update flag, id={}", id);
        PatientFlagEntity saved = patientFlagRepository.findById(id)
                .orElseThrow(() -> new PatientFlagNotFoundException(id));

        if (updateReqDTO.getFlagType() != null) {
            codeValidationService.validateActiveCode(
                    GROUP_PATIENT_FLAG,
                    updateReqDTO.getFlagType(),
                    "flagType"
            );
            saved.setFlagType(updateReqDTO.getFlagType());
        }
        if (updateReqDTO.getActiveYn() != null) saved.setActiveYn(updateReqDTO.getActiveYn());
        if (updateReqDTO.getNote() != null) saved.setNote(updateReqDTO.getNote());

        return patientFlagResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT_FLAG", key = "#id")
    public void remove(Long id) {
        log.info("Service: delete flag, id={}", id);
        if (!patientFlagRepository.existsById(id)) {
            throw new PatientFlagNotFoundException(id);
        }
        patientFlagRepository.deleteById(id);
    }

    @Override
    public List<PatientFlagResDTO> search(String type, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("keyword is required");
        }
        List<PatientFlagEntity> entities = patientFlagMapper.search(type, keyword.trim());
        return patientFlagResMapStruct.toDTOList(entities);
    }
}
