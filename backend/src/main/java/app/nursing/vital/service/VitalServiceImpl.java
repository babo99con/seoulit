package app.nursing.vital.service;

import app.nursing.vital.dto.VitalDTO;
import app.nursing.vital.entity.VitalEntity;
import app.nursing.vital.mapstruct.VitalReqMapStruct;
import app.nursing.vital.mapstruct.VitalResMapStruct;
import app.nursing.vital.repository.VitalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class VitalServiceImpl implements VitalService {

    private final VitalRepository vitalRepository;
    private final VitalReqMapStruct vitalReqMapStruct;
    private final VitalResMapStruct vitalResMapStruct;

    @Override
    public List<VitalDTO> findVitalList() {
        log.info("검체 전체 조회");
        List<VitalEntity> entities = vitalRepository.findAll();
        return vitalResMapStruct.toDTOList(entities);
    }

    @Override
    public VitalDTO findVitalDetail(String id) {
        log.info("Vital detail id={} 로 검체 단건 조회 메서드가 실행됩니다.", id);

        VitalEntity entity = vitalRepository.findById(id).
                orElseThrow(()-> new IllegalArgumentException("해당 검체가 존재하지 않습니다"));

        return vitalResMapStruct.toDTO(entity);
    }

    @Override
    @Transactional
    public VitalDTO registerVital(VitalDTO VitalDTO) {
        log.info("검체 신규 생성 메서드가 실행됩니다");
        VitalEntity entity = vitalReqMapStruct.toEntity(VitalDTO);

        if (entity.getVitalId() == null || entity.getVitalId().trim().isEmpty()) {
            entity.setVitalId("VI-" + UUID.randomUUID().toString().substring(0, 8));
        }

        VitalEntity newVital = vitalRepository.save(entity);
        newVital.setStatus("ACTIVE");
        return vitalResMapStruct.toDTO(newVital);
    }


    @Override
    @Transactional
    public VitalDTO modifyVital(String id, VitalDTO VitalDTO) {
        log.info("Modify Vital id={} 검체 수정 메서드가 실행됩니다", id);

        VitalEntity saved = vitalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("수정할 검체가 존재하지 않습니다"));

        saved.setVisitId(VitalDTO.getVisitId());
        saved.setTemperature(VitalDTO.getTemperature());
        saved.setPulse(VitalDTO.getPulse());
        saved.setRespiration(VitalDTO.getRespiration());
        saved.setBloodPressure(VitalDTO.getBloodPressure());
        saved.setMeasuredAt(VitalDTO.getMeasuredAt());

        VitalEntity updated = vitalRepository.save(saved);
        return vitalResMapStruct.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteVital(String id) {
        log.info("Delete Vital id={} 검체 삭제 메서드가 실행됩니다", id);

        VitalEntity entity = vitalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("비활성화 할 검체이 존재하지 않습니다"));

        entity.setStatus("INACTIVE");
        vitalRepository.save(entity);

    }



    }




