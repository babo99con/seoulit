package app.patient.service.impl;

import app.patient.service.InsuranceService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import app.patient.dto.InsuranceCreateReqDTO;
import app.patient.dto.InsuranceResDTO;
import app.patient.dto.InsuranceUpdateReqDTO;
import app.patient.entity.InsuranceEntity;
import app.patient.exception.InsuranceNotFoundException;
import app.patient.mapper.InsuranceMapper;
import app.patient.mapstruct.InsuranceReqMapStruct;
import app.patient.mapstruct.InsuranceResMapStruct;
import app.patient.repository.InsuranceRepository;
import app.patient.entity.InsuranceHistoryEntity;
import app.patient.repository.InsuranceHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class InsuranceServiceImpl implements InsuranceService {

    private final InsuranceRepository insuranceRepository;
    private final InsuranceMapper insuranceMapper;
    private final InsuranceReqMapStruct insuranceReqMapStruct;
    private final InsuranceResMapStruct insuranceResMapStruct;
    private final InsuranceHistoryRepository insuranceHistoryRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<InsuranceResDTO> findList() {
        log.info("Service: insurance list");
        List<InsuranceEntity> entities = insuranceRepository.findAll();
        return insuranceResMapStruct.toDTOList(entities);
    }

    @Override
    @Cacheable(value = "INSURANCE", key = "#id")
    public InsuranceResDTO findDetail(Long id) {
        log.info("Service: insurance detail, id={}", id);

        InsuranceEntity entity = insuranceRepository.findById(id)
                .orElseThrow(() -> new InsuranceNotFoundException(id));

        return insuranceResMapStruct.toDTO(entity);
    }

    @Override
    public InsuranceResDTO findValidByPatientId(Long patientId) {
        List<InsuranceEntity> list =
                insuranceRepository.findValidByPatientId(patientId, LocalDate.now());
        if (list.isEmpty()) {
            return null;
        }
        return insuranceResMapStruct.toDTO(list.get(0));
    }

    @Override
    @Transactional
    public InsuranceResDTO register(InsuranceCreateReqDTO insuranceCreateReqDTO) {
        log.info("Service: insurance create, payload={}", insuranceCreateReqDTO);

        InsuranceEntity entity = insuranceReqMapStruct.toEntity(insuranceCreateReqDTO);
        entity.setActiveYn(Boolean.TRUE);
        entity.setVerifiedYn(Boolean.FALSE);

        InsuranceEntity saved = insuranceRepository.save(entity);
        logHistory("CREATE", null, saved, "system");
        return insuranceResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "INSURANCE", key = "#id")
    public InsuranceResDTO modify(Long id, InsuranceUpdateReqDTO insuranceUpdateReqDTO) {
        log.info("Service: insurance update, id={}", id);

        InsuranceEntity saved = insuranceRepository.findById(id)
                .orElseThrow(() -> new InsuranceNotFoundException(id));

        InsuranceEntity before = snapshot(saved);
        String changeType = resolveChangeType(saved, insuranceUpdateReqDTO);

        if (insuranceUpdateReqDTO.getInsuranceType() != null) saved.setInsuranceType(insuranceUpdateReqDTO.getInsuranceType());
        if (insuranceUpdateReqDTO.getPolicyNo() != null) saved.setPolicyNo(insuranceUpdateReqDTO.getPolicyNo());
        if (insuranceUpdateReqDTO.getActiveYn() != null) saved.setActiveYn(insuranceUpdateReqDTO.getActiveYn());
        if (insuranceUpdateReqDTO.getVerifiedYn() != null) saved.setVerifiedYn(insuranceUpdateReqDTO.getVerifiedYn());
        if (insuranceUpdateReqDTO.getStartDate() != null) saved.setStartDate(insuranceUpdateReqDTO.getStartDate());
        if (insuranceUpdateReqDTO.getEndDate() != null) saved.setEndDate(insuranceUpdateReqDTO.getEndDate());
        if (insuranceUpdateReqDTO.getNote() != null) saved.setNote(insuranceUpdateReqDTO.getNote());

        logHistory(changeType, before, saved, "system");
        return insuranceResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "INSURANCE", key = "#id")
    public void remove(Long id) {
        log.info("Service: insurance delete, id={}", id);

        InsuranceEntity entity = insuranceRepository.findById(id)
                .orElseThrow(() -> new InsuranceNotFoundException(id));

        InsuranceEntity before = snapshot(entity);
        insuranceRepository.deleteById(id);
        logHistory("DELETE", before, null, "system");
    }

    @Override
    public List<InsuranceResDTO> search(String type, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("keyword is required");
        }

        List<InsuranceEntity> entities = insuranceMapper.search(type, keyword.trim());
        return insuranceResMapStruct.toDTOList(entities);
    }

    private String resolveChangeType(InsuranceEntity current, InsuranceUpdateReqDTO dto) {
        if (dto.getActiveYn() != null && !dto.getActiveYn().equals(current.getActiveYn())) {
            return dto.getActiveYn() ? "ACTIVATE" : "DEACTIVATE";
        }
        if (dto.getVerifiedYn() != null && !dto.getVerifiedYn().equals(current.getVerifiedYn())) {
            return dto.getVerifiedYn() ? "VERIFY" : "UNVERIFY";
        }
        return "UPDATE";
    }

    private InsuranceEntity snapshot(InsuranceEntity src) {
        InsuranceEntity copy = new InsuranceEntity();
        copy.setInsuranceId(src.getInsuranceId());
        copy.setPatientId(src.getPatientId());
        copy.setInsuranceType(src.getInsuranceType());
        copy.setPolicyNo(src.getPolicyNo());
        copy.setActiveYn(src.getActiveYn());
        copy.setVerifiedYn(src.getVerifiedYn());
        copy.setStartDate(src.getStartDate());
        copy.setEndDate(src.getEndDate());
        copy.setNote(src.getNote());
        copy.setCreatedAt(src.getCreatedAt());
        copy.setUpdatedAt(src.getUpdatedAt());
        return copy;
    }

    private void logHistory(String changeType, InsuranceEntity before, InsuranceEntity after, String changedBy) {
        InsuranceHistoryEntity history = new InsuranceHistoryEntity();
        InsuranceEntity base = after != null ? after : before;
        if (base == null) {
            return;
        }
        history.setInsuranceId(base.getInsuranceId());
        history.setPatientId(base.getPatientId());
        history.setChangeType(changeType);
        history.setBeforeData(toJson(before));
        history.setAfterData(toJson(after));
        history.setChangedBy(changedBy);
        insuranceHistoryRepository.save(history);
    }

    private String toJson(InsuranceEntity entity) {
        if (entity == null) return null;
        try {
            return objectMapper.writeValueAsString(entity);
        } catch (JsonProcessingException e) {
            log.warn("보험 이력 JSON 직렬화 실패", e);
            return null;
        }
    }
}

