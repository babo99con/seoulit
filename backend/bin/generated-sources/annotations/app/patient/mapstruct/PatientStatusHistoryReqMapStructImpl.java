package app.patient.mapstruct;

import app.patient.dto.PatientStatusHistoryCreateReqDTO;
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
public class PatientStatusHistoryReqMapStructImpl implements PatientStatusHistoryReqMapStruct {

    @Override
    public List<PatientStatusHistoryEntity> toEntityList(List<PatientStatusHistoryCreateReqDTO> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<PatientStatusHistoryEntity> list = new ArrayList<PatientStatusHistoryEntity>( dtos.size() );
        for ( PatientStatusHistoryCreateReqDTO patientStatusHistoryCreateReqDTO : dtos ) {
            list.add( toEntity( patientStatusHistoryCreateReqDTO ) );
        }

        return list;
    }

    @Override
    public PatientStatusHistoryEntity toEntity(PatientStatusHistoryCreateReqDTO dto) {
        if ( dto == null ) {
            return null;
        }

        PatientStatusHistoryEntity patientStatusHistoryEntity = new PatientStatusHistoryEntity();

        return patientStatusHistoryEntity;
    }
}
