package app.patient.service;

import app.patient.dto.CreateReqDTO;

import app.patient.dto.PatientResDTO;
import app.patient.dto.StatusChangeReqDTO;
import app.patient.dto.UpdateReqDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PatientService {

    List<PatientResDTO> findList();

    PatientResDTO findDetail(Long id);

    PatientResDTO register(CreateReqDTO createreqDTO, MultipartFile file);

    PatientResDTO modify(Long id, UpdateReqDTO updatereqDTO);

    void remove(Long id);

    PatientResDTO changeStatus(Long id, StatusChangeReqDTO statusChangeReqDTO);

    PatientResDTO changeVip(Long id, Boolean isVip);

    List<PatientResDTO> search(String type, String keyword);

    List<PatientResDTO> searchMulti(String name, String birthDate, String phone);
}


