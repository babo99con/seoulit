package app.patient.mapstruct;

import app.patient.dto.PatientResDTO;
import app.patient.entity.PatientEntity;
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
public class PatientResMapStructImpl implements PatientResMapStruct {

    @Override
    public PatientResDTO toDTO(PatientEntity entity) {
        if ( entity == null ) {
            return null;
        }

        PatientResDTO patientResDTO = new PatientResDTO();

        return patientResDTO;
    }

    @Override
    public List<PatientResDTO> toDTOList(List<PatientEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<PatientResDTO> list = new ArrayList<PatientResDTO>( entities.size() );
        for ( PatientEntity patientEntity : entities ) {
            list.add( toDTO( patientEntity ) );
        }

        return list;
    }
}
