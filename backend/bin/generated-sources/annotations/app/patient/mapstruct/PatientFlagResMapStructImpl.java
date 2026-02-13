package app.patient.mapstruct;

import app.patient.dto.PatientFlagResDTO;
import app.patient.entity.PatientFlagEntity;
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
public class PatientFlagResMapStructImpl implements PatientFlagResMapStruct {

    @Override
    public PatientFlagResDTO toDTO(PatientFlagEntity entity) {
        if ( entity == null ) {
            return null;
        }

        PatientFlagResDTO patientFlagResDTO = new PatientFlagResDTO();

        return patientFlagResDTO;
    }

    @Override
    public List<PatientFlagResDTO> toDTOList(List<PatientFlagEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<PatientFlagResDTO> list = new ArrayList<PatientFlagResDTO>( entities.size() );
        for ( PatientFlagEntity patientFlagEntity : entities ) {
            list.add( toDTO( patientFlagEntity ) );
        }

        return list;
    }
}
