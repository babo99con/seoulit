package app.nursing.specimen.mapstruct;
//응답할 때는 dto로 변환해서 보내기


import app.nursing.specimen.dto.SpecimenDTO;
import app.nursing.specimen.entity.SpecimenEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SpecimenResMapStruct {

    SpecimenDTO toDTO(SpecimenEntity entity) ;

    List<SpecimenDTO> toDTOList(List<SpecimenEntity> entities) ;

}

