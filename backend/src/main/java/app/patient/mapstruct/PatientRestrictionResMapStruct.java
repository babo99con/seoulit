package app.patient.mapstruct;

import app.common.mapper.EntityResMapper;
import app.patient.dto.PatientRestrictionResDTO;
import app.patient.entity.PatientRestrictionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientRestrictionResMapStruct extends EntityResMapper<PatientRestrictionEntity, PatientRestrictionResDTO> {
    @Override
    PatientRestrictionResDTO toDTO(PatientRestrictionEntity entity);

    @Override
    List<PatientRestrictionResDTO> toDTOList(List<PatientRestrictionEntity> entities);
}

