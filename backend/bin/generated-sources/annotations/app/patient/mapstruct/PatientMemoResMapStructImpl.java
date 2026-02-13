package app.patient.mapstruct;

import app.patient.dto.PatientMemoResDTO;
import app.patient.entity.PatientMemoEntity;
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
public class PatientMemoResMapStructImpl implements PatientMemoResMapStruct {

    @Override
    public PatientMemoResDTO toDTO(PatientMemoEntity entity) {
        if ( entity == null ) {
            return null;
        }

        PatientMemoResDTO patientMemoResDTO = new PatientMemoResDTO();

        return patientMemoResDTO;
    }

    @Override
    public List<PatientMemoResDTO> toDTOList(List<PatientMemoEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<PatientMemoResDTO> list = new ArrayList<PatientMemoResDTO>( entities.size() );
        for ( PatientMemoEntity patientMemoEntity : entities ) {
            list.add( toDTO( patientMemoEntity ) );
        }

        return list;
    }
}
