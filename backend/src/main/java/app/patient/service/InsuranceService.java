package app.patient.service;

import app.patient.dto.InsuranceCreateReqDTO;
import app.patient.dto.InsuranceResDTO;
import app.patient.dto.InsuranceUpdateReqDTO;

import java.util.List;

public interface InsuranceService {
    List<InsuranceResDTO> findList();

    InsuranceResDTO findDetail(Long id);

    InsuranceResDTO register(InsuranceCreateReqDTO insuranceCreateReqDTO);

    InsuranceResDTO modify(Long id, InsuranceUpdateReqDTO insuranceUpdateReqDTO);

    void remove(Long id);

    List<InsuranceResDTO> search(String type, String keyword);

    InsuranceResDTO findValidByPatientId(Long patientId);
}

