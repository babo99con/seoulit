package app.patient.service.impl;

import app.patient.dto.InsuranceHistoryResDTO;
import app.patient.entity.InsuranceHistoryEntity;
import app.patient.repository.InsuranceHistoryRepository;
import app.patient.service.InsuranceHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class InsuranceHistoryServiceImpl implements InsuranceHistoryService {

    private final InsuranceHistoryRepository insuranceHistoryRepository;

    @Override
    public List<InsuranceHistoryResDTO> findByPatientId(Long patientId) {
        log.info("Service: insurance history list, patientId={}", patientId);
        List<InsuranceHistoryEntity> entities =
                insuranceHistoryRepository.findByPatientIdOrderByChangedAtDesc(patientId);
        return entities.stream().map(this::toDTO).toList();
    }

    private InsuranceHistoryResDTO toDTO(InsuranceHistoryEntity entity) {
        return new InsuranceHistoryResDTO(
                entity.getHistoryId(),
                entity.getInsuranceId(),
                entity.getPatientId(),
                entity.getChangeType(),
                entity.getBeforeData(),
                entity.getAfterData(),
                entity.getChangedBy(),
                entity.getChangedAt()
        );
    }
}

