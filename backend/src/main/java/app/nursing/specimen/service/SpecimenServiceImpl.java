package app.nursing.specimen.service;

import app.nursing.specimen.dto.SpecimenDTO;
import app.nursing.specimen.entity.SpecimenEntity;
import app.nursing.specimen.mapstruct.SpecimenReqMapStruct;
import app.nursing.specimen.mapstruct.SpecimenResMapStruct;
import app.nursing.specimen.repository.SpecimenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class SpecimenServiceImpl implements SpecimenService {

    private final SpecimenRepository specimenRepository;
    private final SpecimenReqMapStruct specimenReqMapStruct;
    private final SpecimenResMapStruct specimenResMapStruct;

    @Override
    public List<SpecimenDTO> findSpecimenList() {
        log.info("검체 전체 조회");
        List<SpecimenEntity> entities = specimenRepository.findAll();
        return specimenResMapStruct.toDTOList(entities);
    }

    @Override
    public SpecimenDTO findSpecimenDetail(String id) {
        log.info("Specimen detail id={} 로 검체 단건 조회 메서드가 실행됩니다.", id);

        SpecimenEntity entity = specimenRepository.findById(id).
                orElseThrow(()-> new IllegalArgumentException("해당 검체가 존재하지 않습니다"));

        return specimenResMapStruct.toDTO(entity);
    }

    @Override
    @Transactional
    public SpecimenDTO registerSpecimen(SpecimenDTO specimenDTO) {
        log.info("검체 신규 생성 메서드가 실행됩니다");
        SpecimenEntity entity = specimenReqMapStruct.toEntity(specimenDTO);

        if (entity.getSpecimenId() == null || entity.getSpecimenId().trim().isEmpty()) {
            entity.setSpecimenId("Sp_" + UUID.randomUUID());
        }
        SpecimenEntity newSpecimen = specimenRepository.save(entity);
        return specimenResMapStruct.toDTO(newSpecimen);
    }


    @Override
    @Transactional
    public SpecimenDTO modifySpecimen(String id, SpecimenDTO specimenDTO) {
        log.info("Modify specimen id={} 검체 수정 메서드가 실행됩니다", id);

        SpecimenEntity saved = specimenRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("수정할 검체이 존재하지 않습니다"));

        saved.setVisitId(specimenDTO.getVisitId());
        saved.setSpecimenType(specimenDTO.getSpecimenType());
        saved.setStatus(specimenDTO.getStatus());
        saved.setCreatedBy(specimenDTO.getCreatedBy());

        SpecimenEntity updated = specimenRepository.save(saved);
        return specimenResMapStruct.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteSpecimen(String id) {
        log.info("Delete specimen id={} 검체 삭제 메서드가 실행됩니다", id);

        SpecimenEntity entity = specimenRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("비활성화 할 검체이 존재하지 않습니다"));

        entity.setStatus("N");

        specimenRepository.save(entity);

    }



    }




