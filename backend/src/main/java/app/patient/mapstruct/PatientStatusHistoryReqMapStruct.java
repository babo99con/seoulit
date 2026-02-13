package app.patient.mapstruct;

import app.common.mapper.EntityReqMapper;
import app.patient.dto.PatientStatusHistoryCreateReqDTO;
import app.patient.entity.PatientStatusHistoryEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientStatusHistoryReqMapStruct
        extends EntityReqMapper<PatientStatusHistoryEntity, PatientStatusHistoryCreateReqDTO> {
    @Override
    PatientStatusHistoryEntity toEntity(PatientStatusHistoryCreateReqDTO dto);
}
