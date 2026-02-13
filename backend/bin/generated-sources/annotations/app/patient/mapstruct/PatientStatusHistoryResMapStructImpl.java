package app.patient.mapstruct;

import app.patient.dto.PatientStatusHistoryResDTO;
import app.patient.entity.PatientStatusHistoryEntity;
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
public class PatientStatusHistoryResMapStructImpl implements PatientStatusHistoryResMapStruct {

    @Override
    public List<PatientStatusHistoryResDTO> toDTOList(List<PatientStatusHistoryEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<PatientStatusHistoryResDTO> list = new ArrayList<PatientStatusHistoryResDTO>( entities.size() );
        for ( PatientStatusHistoryEntity patientStatusHistoryEntity : entities ) {
            list.add( toDTO( patientStatusHistoryEntity ) );
        }

        return list;
    }

    @Override
    public PatientStatusHistoryResDTO toDTO(PatientStatusHistoryEntity entity) {
        if ( entity == null ) {
            return null;
        }

        PatientStatusHistoryResDTO patientStatusHistoryResDTO = new PatientStatusHistoryResDTO();

        return patientStatusHistoryResDTO;
    }
}
