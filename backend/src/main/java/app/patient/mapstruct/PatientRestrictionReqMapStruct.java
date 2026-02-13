package app.patient.mapstruct;

import app.common.mapper.EntityReqMapper;
import app.patient.dto.PatientRestrictionCreateReqDTO;
import app.patient.entity.PatientRestrictionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientRestrictionReqMapStruct extends EntityReqMapper<PatientRestrictionEntity, PatientRestrictionCreateReqDTO> {
    @Override
    PatientRestrictionEntity toEntity(PatientRestrictionCreateReqDTO dto);
}

