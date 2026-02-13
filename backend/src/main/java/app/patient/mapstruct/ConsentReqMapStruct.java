package app.patient.mapstruct;


import app.common.mapper.EntityReqMapper;
import app.patient.dto.ConsentCreateReqDTO;
import app.patient.entity.ConsentEntity;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ConsentReqMapStruct extends EntityReqMapper<ConsentEntity, ConsentCreateReqDTO>
{
    @Override
    ConsentEntity toEntity(ConsentCreateReqDTO dto) ;

}
