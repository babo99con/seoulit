package app.nursing.assessment.service;

import app.nursing.assessment.dto.AssessmentDTO;
import app.nursing.assessment.entity.AssessmentEntity;
import app.nursing.assessment.mapstruct.AssessmentReqMapStruct;
import app.nursing.assessment.mapstruct.AssessmentResMapStruct;
import app.nursing.assessment.repository.AssessmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class AssessmentServiceImpl implements AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentReqMapStruct assessmentReqMapStruct;
    private final AssessmentResMapStruct assessmentResMapStruct;

    @Override
    public List<AssessmentDTO> findAssessmentList() {
        log.info("문건 전체 조회");
        List<AssessmentEntity> entities = assessmentRepository.findAll();
        return assessmentResMapStruct.toDTOList(entities);
    }

    @Override
    public AssessmentDTO findAssessmentDetail(String id) {
        log.info("Assessment detail id={} 로 문진 단건 조회 메서드가 실행됩니다.", id);

        AssessmentEntity entity = assessmentRepository.findById(id).
                orElseThrow(()-> new IllegalArgumentException("해당 문건이 존재하지 않습니다"));

        return assessmentResMapStruct.toDTO(entity);
    }

    @Override
    @Transactional
    public AssessmentDTO registerAssessment(AssessmentDTO assessmentDTO) {
        log.info("문건 신규 생성 메서드가 실행됩니다");
        AssessmentEntity entity = assessmentReqMapStruct.toEntity(assessmentDTO);

        if (entity.getAssessmentId() == null || entity.getAssessmentId().trim().isEmpty()) {
            entity.setAssessmentId("NA_" + UUID.randomUUID());
        }
        AssessmentEntity newAssessment = assessmentRepository.save(entity);
        return assessmentResMapStruct.toDTO(newAssessment);
    }


    @Override
    @Transactional
    public AssessmentDTO modifyAssessment(String id, AssessmentDTO assessmentDTO) {
        log.info("Modify assessment id={} 문건 수정 메서드가 실행됩니다", id);

        AssessmentEntity saved = assessmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("수정할 문건이 존재하지 않습니다"));

        saved.setVisitId(assessmentDTO.getVisitId());
        saved.setVisitReason(assessmentDTO.getVisitReason());
        saved.setMedicalHistory(assessmentDTO.getMedicalHistory());
        saved.setAllergyYn(assessmentDTO.getAllergyYn());
        saved.setAllergyNote(assessmentDTO.getAllergyNote());
        saved.setNurseId(assessmentDTO.getNurseId());

        AssessmentEntity updated = assessmentRepository.save(saved);
        return assessmentResMapStruct.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteAssessment(String id) {
        log.info("Delete assessment id={} 문건 삭제 메서드가 실행됩니다", id);

        AssessmentEntity entity = assessmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("비활성화 할 문건이 존재하지 않습니다"));

        entity.setIsActive("N");

        assessmentRepository.save(entity);

    }



    }




