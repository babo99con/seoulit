package app.patient.mapstruct;

import app.patient.dto.PatientRestrictionResDTO;
import app.patient.entity.PatientRestrictionEntity;
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
public class PatientRestrictionResMapStructImpl implements PatientRestrictionResMapStruct {

    @Override
    public PatientRestrictionResDTO toDTO(PatientRestrictionEntity entity) {
        if ( entity == null ) {
            return null;
        }

        PatientRestrictionResDTO patientRestrictionResDTO = new PatientRestrictionResDTO();

        return patientRestrictionResDTO;
    }

    @Override
    public List<PatientRestrictionResDTO> toDTOList(List<PatientRestrictionEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<PatientRestrictionResDTO> list = new ArrayList<PatientRestrictionResDTO>( entities.size() );
        for ( PatientRestrictionEntity patientRestrictionEntity : entities ) {
            list.add( toDTO( patientRestrictionEntity ) );
        }

        return list;
    }
}
