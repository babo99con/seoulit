package app.patient.mapstruct;

import app.common.mapper.EntityResMapper;
import app.patient.dto.PatientMemoResDTO;
import app.patient.entity.PatientMemoEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientMemoResMapStruct extends EntityResMapper<PatientMemoEntity, PatientMemoResDTO> {
    @Override
    PatientMemoResDTO toDTO(PatientMemoEntity entity);

    @Override
    List<PatientMemoResDTO> toDTOList(List<PatientMemoEntity> entities);
}

