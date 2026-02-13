package app.patient.service;



import app.patient.dto.PatientRestrictionCreateReqDTO;
import app.patient.dto.PatientRestrictionResDTO;
import app.patient.dto.PatientRestrictionUpdateReqDTO;

import java.util.List;

public interface PatientRestrictionService {

    List<PatientRestrictionResDTO> findList();

    PatientRestrictionResDTO findDetail(Long id);

    PatientRestrictionResDTO register(PatientRestrictionCreateReqDTO createReqDTO);

    PatientRestrictionResDTO modify(Long id, PatientRestrictionUpdateReqDTO updateReqDTO);

    void remove(Long id);

    List<PatientRestrictionResDTO> search(String type, String keyword);
}

