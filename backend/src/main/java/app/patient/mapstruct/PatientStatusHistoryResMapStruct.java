package app.patient.mapstruct;

import app.common.mapper.EntityResMapper;
import app.patient.dto.PatientStatusHistoryResDTO;
import app.patient.entity.PatientStatusHistoryEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientStatusHistoryResMapStruct
        extends EntityResMapper<PatientStatusHistoryEntity, PatientStatusHistoryResDTO> {
    @Override
    PatientStatusHistoryResDTO toDTO(PatientStatusHistoryEntity entity);
}
