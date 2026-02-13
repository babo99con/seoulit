package app.patient.service;

import app.patient.dto.PatientStatusHistoryCreateReqDTO;
import app.patient.dto.PatientStatusHistoryResDTO;
import app.patient.dto.PatientStatusHistoryUpdateReqDTO;

import java.util.List;

public interface PatientStatusHistoryService {
    List<PatientStatusHistoryResDTO> findList();

    PatientStatusHistoryResDTO findDetail(Long id);

    PatientStatusHistoryResDTO register(PatientStatusHistoryCreateReqDTO createReqDTO);

    PatientStatusHistoryResDTO modify(Long id, PatientStatusHistoryUpdateReqDTO updateReqDTO);

    void remove(Long id);

    List<PatientStatusHistoryResDTO> search(String type, String keyword);
}
