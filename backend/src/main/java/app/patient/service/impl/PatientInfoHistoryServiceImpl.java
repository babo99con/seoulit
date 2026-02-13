package app.patient.service.impl;

import app.patient.dto.PatientInfoHistoryResDTO;
import app.patient.entity.PatientInfoHistoryEntity;
import app.patient.repository.PatientInfoHistoryRepository;
import app.patient.service.PatientInfoHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PatientInfoHistoryServiceImpl implements PatientInfoHistoryService {

    private final PatientInfoHistoryRepository patientInfoHistoryRepository;

    @Override
    public List<PatientInfoHistoryResDTO> findByPatientId(Long patientId) {
        log.info("Service: patient info history list, patientId={}", patientId);
        List<PatientInfoHistoryEntity> entities =
                patientInfoHistoryRepository.findByPatientIdOrderByChangedAtDesc(patientId);
        return entities.stream().map(this::toDTO).toList();
    }

    private PatientInfoHistoryResDTO toDTO(PatientInfoHistoryEntity entity) {
        return new PatientInfoHistoryResDTO(
                entity.getHistoryId(),
                entity.getPatientId(),
                entity.getChangeType(),
                entity.getBeforeData(),
                entity.getAfterData(),
                entity.getChangedBy(),
                entity.getChangedAt()
        );
    }
}
