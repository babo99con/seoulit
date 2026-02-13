package app.patient.mapstruct;

import app.common.mapper.EntityResMapper;
import app.patient.dto.PatientResDTO;
import app.patient.entity.PatientEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientResMapStruct extends EntityResMapper<PatientEntity, PatientResDTO>
{
    @Override
    PatientResDTO toDTO(PatientEntity entity) ;
    @Override
    List<PatientResDTO> toDTOList(List<PatientEntity> entities) ;



}
