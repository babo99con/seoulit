package app.patient.mapstruct;



import app.common.mapper.EntityResMapper;
import app.patient.dto.ConsentResDTO;
import app.patient.entity.ConsentEntity;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ConsentResMapStruct extends EntityResMapper<ConsentEntity, ConsentResDTO>
{
    @Override
    ConsentResDTO toDTO(ConsentEntity entity) ;
    @Override
    List<ConsentResDTO> toDTOList(List<ConsentEntity> entities) ;



}
