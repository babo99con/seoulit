package app.patient.mapstruct;


import app.common.mapper.EntityReqMapper;
import app.patient.dto.CreateReqDTO;
import app.patient.entity.PatientEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientReqMapStruct extends EntityReqMapper<PatientEntity, CreateReqDTO>
{
    @Override
    PatientEntity toEntity(CreateReqDTO dto) ;

}
