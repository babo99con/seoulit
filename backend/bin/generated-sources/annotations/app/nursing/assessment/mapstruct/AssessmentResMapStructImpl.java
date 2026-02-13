package app.nursing.assessment.mapstruct;

import app.nursing.assessment.dto.AssessmentDTO;
import app.nursing.assessment.entity.AssessmentEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-13T15:27:28+0900",
    comments = "version: 1.5.3.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260210-1510, environment: Java 21.0.10 (Microsoft)"
)
@Component
public class AssessmentResMapStructImpl implements AssessmentResMapStruct {

    @Override
    public AssessmentDTO toDTO(AssessmentEntity entity) {
        if ( entity == null ) {
            return null;
        }

        AssessmentDTO assessmentDTO = new AssessmentDTO();

        return assessmentDTO;
    }

    @Override
    public List<AssessmentDTO> toDTOList(List<AssessmentEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<AssessmentDTO> list = new ArrayList<AssessmentDTO>( entities.size() );
        for ( AssessmentEntity assessmentEntity : entities ) {
            list.add( toDTO( assessmentEntity ) );
        }

        return list;
    }
}
