package app.patient.service;

import app.patient.dto.PatientInfoHistoryResDTO;

import java.util.List;

public interface PatientInfoHistoryService {
    List<PatientInfoHistoryResDTO> findByPatientId(Long patientId);
}
