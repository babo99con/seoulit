package app.patient.mapstruct;

import app.common.mapper.EntityResMapper;
import app.patient.dto.InsuranceResDTO;
import app.patient.entity.InsuranceEntity;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InsuranceResMapStruct extends EntityResMapper<InsuranceEntity, InsuranceResDTO>
{
    @Override
    InsuranceResDTO toDTO(InsuranceEntity entity) ;
    @Override
    List<InsuranceResDTO> toDTOList(List<InsuranceEntity> entities) ;



}
