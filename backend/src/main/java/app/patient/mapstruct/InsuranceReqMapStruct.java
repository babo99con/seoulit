package app.patient.mapstruct;


import app.common.mapper.EntityReqMapper;
import app.patient.dto.InsuranceCreateReqDTO;
import app.patient.entity.InsuranceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InsuranceReqMapStruct extends EntityReqMapper<InsuranceEntity, InsuranceCreateReqDTO>
{
    @Override
    InsuranceEntity toEntity(InsuranceCreateReqDTO dto) ;

}
