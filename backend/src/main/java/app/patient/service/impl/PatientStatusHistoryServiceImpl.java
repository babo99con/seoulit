package app.patient.service.impl;


import app.patient.dto.PatientStatusHistoryCreateReqDTO;
import app.patient.dto.PatientStatusHistoryResDTO;
import app.patient.dto.PatientStatusHistoryUpdateReqDTO;
import app.patient.entity.PatientStatusHistoryEntity;
import app.patient.exception.PatientStatusHistoryNotFoundException;
import app.patient.mapper.PatientStatusHistoryMapper;
import app.patient.mapstruct.PatientStatusHistoryReqMapStruct;
import app.patient.mapstruct.PatientStatusHistoryResMapStruct;
import app.patient.repository.PatientStatusHistoryRepository;
import app.patient.service.PatientStatusHistoryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PatientStatusHistoryServiceImpl implements PatientStatusHistoryService {

    private final PatientStatusHistoryRepository patientStatusHistoryRepository;
    private final PatientStatusHistoryMapper patientStatusHistoryMapper;
    private final PatientStatusHistoryReqMapStruct patientStatusHistoryReqMapStruct;
    private final PatientStatusHistoryResMapStruct patientStatusHistoryResMapStruct;

    @Override
    public List<PatientStatusHistoryResDTO> findList() {
        log.info("Service: list patient status history");
        List<PatientStatusHistoryEntity> entities = patientStatusHistoryRepository.findAll();
        return patientStatusHistoryResMapStruct.toDTOList(entities);
    }

    @Override
    @Cacheable(value = "PATIENT_STATUS_HISTORY", key = "#id")
    public PatientStatusHistoryResDTO findDetail(Long id) {
        log.info("Service: status history detail, id={}", id);
        PatientStatusHistoryEntity entity = patientStatusHistoryRepository.findById(id)
                .orElseThrow(() -> new PatientStatusHistoryNotFoundException(id));
        return patientStatusHistoryResMapStruct.toDTO(entity);
    }

    @Override
    @Transactional
    public PatientStatusHistoryResDTO register(PatientStatusHistoryCreateReqDTO createReqDTO) {
        log.info("Service: create status history");
        PatientStatusHistoryEntity entity = patientStatusHistoryReqMapStruct.toEntity(createReqDTO);
        PatientStatusHistoryEntity saved = patientStatusHistoryRepository.save(entity);
        return patientStatusHistoryResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT_STATUS_HISTORY", key = "#id")
    public PatientStatusHistoryResDTO modify(Long id, PatientStatusHistoryUpdateReqDTO updateReqDTO) {
        log.info("Service: update status history, id={}", id);
        PatientStatusHistoryEntity saved = patientStatusHistoryRepository.findById(id)
                .orElseThrow(() -> new PatientStatusHistoryNotFoundException(id));

        if (updateReqDTO.getFromStatus() != null) saved.setFromStatus(updateReqDTO.getFromStatus());
        if (updateReqDTO.getToStatus() != null) saved.setToStatus(updateReqDTO.getToStatus());
        if (updateReqDTO.getReason() != null) saved.setReason(updateReqDTO.getReason());
        if (updateReqDTO.getChangedBy() != null) saved.setChangedBy(updateReqDTO.getChangedBy());

        return patientStatusHistoryResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT_STATUS_HISTORY", key = "#id")
    public void remove(Long id) {
        log.info("Service: delete status history, id={}", id);
        if (!patientStatusHistoryRepository.existsById(id)) {
            throw new PatientStatusHistoryNotFoundException(id);
        }
        patientStatusHistoryRepository.deleteById(id);
    }

    @Override
    public List<PatientStatusHistoryResDTO> search(String type, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("keyword is required");
        }
        List<PatientStatusHistoryEntity> entities =
                patientStatusHistoryMapper.search(type, keyword.trim());
        return patientStatusHistoryResMapStruct.toDTOList(entities);
    }
}
