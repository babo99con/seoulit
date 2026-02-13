package app.patient.service.impl;

import app.patient.dto.PatientMemoCreateReqDTO;
import app.patient.dto.PatientMemoResDTO;
import app.patient.dto.PatientMemoUpdateReqDTO;
import app.patient.entity.PatientMemoEntity;
import app.patient.exception.PatientMemoNotFoundException;
import app.patient.mapper.PatientMemoMapper;
import app.patient.mapstruct.PatientMemoReqMapStruct;
import app.patient.mapstruct.PatientMemoResMapStruct;
import app.patient.repository.PatientMemoRepository;
import app.patient.service.PatientMemoService;
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
public class PatientMemoServiceImpl implements PatientMemoService {

    private final PatientMemoRepository patientMemoRepository;
    private final PatientMemoMapper patientMemoMapper;
    private final PatientMemoReqMapStruct patientMemoReqMapStruct;
    private final PatientMemoResMapStruct patientMemoResMapStruct;

    @Override
    public List<PatientMemoResDTO> findList() {
        log.info("Service: list patient memos");
        List<PatientMemoEntity> entities = patientMemoRepository.findAll();
        return patientMemoResMapStruct.toDTOList(entities);
    }

    @Override
    @Cacheable(value = "PATIENT_MEMO", key = "#id")
    public PatientMemoResDTO findDetail(Long id) {
        log.info("Service: memo detail, id={}", id);
        PatientMemoEntity entity = patientMemoRepository.findById(id)
                .orElseThrow(() -> new PatientMemoNotFoundException(id));
        return patientMemoResMapStruct.toDTO(entity);
    }

    @Override
    @Transactional
    public PatientMemoResDTO register(PatientMemoCreateReqDTO createReqDTO) {
        log.info("Service: create memo");
        PatientMemoEntity entity = patientMemoReqMapStruct.toEntity(createReqDTO);
        PatientMemoEntity saved = patientMemoRepository.save(entity);
        return patientMemoResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT_MEMO", key = "#id")
    public PatientMemoResDTO modify(Long id, PatientMemoUpdateReqDTO updateReqDTO) {
        log.info("Service: update memo, id={}", id);
        PatientMemoEntity saved = patientMemoRepository.findById(id)
                .orElseThrow(() -> new PatientMemoNotFoundException(id));

        if (updateReqDTO.getMemo() != null) {
            saved.setMemo(updateReqDTO.getMemo());
        }

        return patientMemoResMapStruct.toDTO(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "PATIENT_MEMO", key = "#id")
    public void remove(Long id) {
        log.info("Service: delete memo, id={}", id);
        if (!patientMemoRepository.existsById(id)) {
            throw new PatientMemoNotFoundException(id);
        }
        patientMemoRepository.deleteById(id);
    }

    @Override
    public List<PatientMemoResDTO> search(String type, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("keyword is required");
        }
        List<PatientMemoEntity> entities = patientMemoMapper.search(type, keyword.trim());
        return patientMemoResMapStruct.toDTOList(entities);
    }
}

