package app.patient.service;

import app.patient.dto.PatientFlagCreateReqDTO;
import app.patient.dto.PatientFlagResDTO;
import app.patient.dto.PatientFlagUpdateReqDTO;


import java.util.List;

public interface PatientFlagService {

    List<PatientFlagResDTO> findList();

    PatientFlagResDTO findDetail(Long id);

    PatientFlagResDTO register(PatientFlagCreateReqDTO createReqDTO);

    PatientFlagResDTO modify(Long id, PatientFlagUpdateReqDTO updateReqDTO);

    void remove(Long id);

    List<PatientFlagResDTO> search(String type, String keyword);
}
