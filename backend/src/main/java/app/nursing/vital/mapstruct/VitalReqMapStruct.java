package app.nursing.vital.mapstruct;
//요청할 때는 dto에서 entity 로 변환해서 보내기


import app.nursing.vital.dto.VitalDTO;
import app.nursing.vital.entity.VitalEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VitalReqMapStruct {

    VitalEntity toEntity(VitalDTO dto) ;

}
