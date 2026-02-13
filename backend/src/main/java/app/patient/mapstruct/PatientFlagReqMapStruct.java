package app.patient.mapstruct;

import app.common.mapper.EntityReqMapper;
import app.patient.dto.PatientFlagCreateReqDTO;
import app.patient.entity.PatientFlagEntity;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientFlagReqMapStruct extends EntityReqMapper<PatientFlagEntity, PatientFlagCreateReqDTO> {
    @Override
    PatientFlagEntity toEntity(PatientFlagCreateReqDTO dto);
}
