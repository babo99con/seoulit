package app.patient.mapstruct;

import app.common.mapper.EntityReqMapper;
import app.patient.dto.PatientMemoCreateReqDTO;
import app.patient.entity.PatientMemoEntity;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientMemoReqMapStruct extends EntityReqMapper<PatientMemoEntity, PatientMemoCreateReqDTO> {
    @Override
    PatientMemoEntity toEntity(PatientMemoCreateReqDTO dto);
}

