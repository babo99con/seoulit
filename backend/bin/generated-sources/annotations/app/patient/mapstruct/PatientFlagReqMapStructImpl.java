package app.patient.mapstruct;

import app.patient.dto.PatientFlagCreateReqDTO;
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
public class PatientFlagReqMapStructImpl implements PatientFlagReqMapStruct {

    @Override
    public List<PatientFlagEntity> toEntityList(List<PatientFlagCreateReqDTO> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<PatientFlagEntity> list = new ArrayList<PatientFlagEntity>( dtos.size() );
        for ( PatientFlagCreateReqDTO patientFlagCreateReqDTO : dtos ) {
            list.add( toEntity( patientFlagCreateReqDTO ) );
        }

        return list;
    }

    @Override
    public PatientFlagEntity toEntity(PatientFlagCreateReqDTO dto) {
        if ( dto == null ) {
            return null;
        }

        PatientFlagEntity patientFlagEntity = new PatientFlagEntity();

        return patientFlagEntity;
    }
}
