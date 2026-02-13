package app.nursing.assessment.mapstruct;
//요청할 때는 dto에서 entity 로 변환해서 보내기

import app.nursing.assessment.dto.AssessmentDTO;
import app.nursing.assessment.entity.AssessmentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AssessmentReqMapStruct {

    AssessmentEntity toEntity(AssessmentDTO dto) ;

}
