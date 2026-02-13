package app.nursing.specimen.mapstruct;
//요청할 때는 dto에서 entity 로 변환해서 보내기


import app.nursing.specimen.dto.SpecimenDTO;
import app.nursing.specimen.entity.SpecimenEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SpecimenReqMapStruct {

    SpecimenEntity toEntity(SpecimenDTO dto) ;

}
