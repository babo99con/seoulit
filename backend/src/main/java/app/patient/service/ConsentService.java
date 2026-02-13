package app.patient.service;


import app.patient.dto.ConsentCreateReqDTO;
import app.patient.dto.ConsentLatestResDTO;
import app.patient.dto.ConsentResDTO;
import app.patient.dto.ConsentUpdateReqDTO;
import app.patient.dto.ConsentWithdrawHistoryResDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ConsentService {

    List<ConsentResDTO> findList(Long patientId);

    ConsentResDTO findDetail(Long patientId, Long consentId);

    ConsentResDTO register(Long patientId, ConsentCreateReqDTO createReqDTO, MultipartFile file);

    ConsentResDTO modify(Long patientId, Long consentId, ConsentUpdateReqDTO updateReqDTO, MultipartFile file);

    void remove(Long patientId, Long consentId);

    List<ConsentResDTO> search(Long patientId, String type, String keyword);

    List<ConsentLatestResDTO> findLatestByPatient(Long patientId);

    List<ConsentWithdrawHistoryResDTO> findWithdrawHistory(Long patientId);
}

