package app.patient.mapstruct;

import app.common.mapper.EntityResMapper;
import app.patient.dto.PatientFlagResDTO;
import app.patient.entity.PatientFlagEntity;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientFlagResMapStruct extends EntityResMapper<PatientFlagEntity, PatientFlagResDTO> {
    @Override
    PatientFlagResDTO toDTO(PatientFlagEntity entity);

    @Override
    List<PatientFlagResDTO> toDTOList(List<PatientFlagEntity> entities);
}
