package app.nursing.vital.mapstruct;
//응답할 때는 dto로 변환해서 보내기


import app.nursing.vital.dto.VitalDTO;
import app.nursing.vital.entity.VitalEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VitalResMapStruct {

    VitalDTO toDTO(VitalEntity entity) ;

    List<VitalDTO> toDTOList(List<VitalEntity> entities) ;

}

