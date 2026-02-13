package app.patient.service;



import app.patient.dto.PatientMemoCreateReqDTO;
import app.patient.dto.PatientMemoResDTO;
import app.patient.dto.PatientMemoUpdateReqDTO;

import java.util.List;

public interface PatientMemoService {

    List<PatientMemoResDTO> findList();

    PatientMemoResDTO findDetail(Long id);

    PatientMemoResDTO register(PatientMemoCreateReqDTO createReqDTO);

    PatientMemoResDTO modify(Long id, PatientMemoUpdateReqDTO updateReqDTO);

    void remove(Long id);

    List<PatientMemoResDTO> search(String type, String keyword);
}

