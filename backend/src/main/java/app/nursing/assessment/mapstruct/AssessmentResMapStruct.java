package app.nursing.assessment.mapstruct;
//응답할 때는 dto로 변환해서 보내기


import app.nursing.assessment.dto.AssessmentDTO;
import app.nursing.assessment.entity.AssessmentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AssessmentResMapStruct {

    AssessmentDTO toDTO(AssessmentEntity entity) ;

    List<AssessmentDTO> toDTOList(List<AssessmentEntity> entities) ;

}

