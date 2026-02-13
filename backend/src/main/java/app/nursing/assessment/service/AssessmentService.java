package app.nursing.assessment.service;

import app.nursing.assessment.dto.AssessmentDTO;
import app.patient.dto.PatientResDTO;
import app.patient.dto.UpdateReqDTO;

import java.util.List;

public interface AssessmentService {

    List<AssessmentDTO> findAssessmentList();
    AssessmentDTO findAssessmentDetail(String id);
    AssessmentDTO registerAssessment(AssessmentDTO assessmentDTO);
    AssessmentDTO modifyAssessment(String id, AssessmentDTO assessmentDTO);
    void deleteAssessment(String id);



}


