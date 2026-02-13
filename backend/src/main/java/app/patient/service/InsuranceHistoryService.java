package app.patient.service;

import app.patient.dto.InsuranceHistoryResDTO;

import java.util.List;

public interface InsuranceHistoryService {
    List<InsuranceHistoryResDTO> findByPatientId(Long patientId);
}

