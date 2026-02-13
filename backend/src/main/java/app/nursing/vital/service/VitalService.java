package app.nursing.vital.service;

import app.nursing.vital.dto.VitalDTO;

import java.util.List;

public interface VitalService {

    List<VitalDTO> findVitalList();
    VitalDTO findVitalDetail(String id);
    VitalDTO registerVital(VitalDTO VitalDTO);
    VitalDTO modifyVital(String id, VitalDTO VitalDTO);
    void deleteVital(String id);



}


