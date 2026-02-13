package app.patient.mapstruct;

import app.patient.dto.PatientRestrictionCreateReqDTO;
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
public class PatientRestrictionReqMapStructImpl implements PatientRestrictionReqMapStruct {

    @Override
    public List<PatientRestrictionEntity> toEntityList(List<PatientRestrictionCreateReqDTO> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<PatientRestrictionEntity> list = new ArrayList<PatientRestrictionEntity>( dtos.size() );
        for ( PatientRestrictionCreateReqDTO patientRestrictionCreateReqDTO : dtos ) {
            list.add( toEntity( patientRestrictionCreateReqDTO ) );
        }

        return list;
    }

    @Override
    public PatientRestrictionEntity toEntity(PatientRestrictionCreateReqDTO dto) {
        if ( dto == null ) {
            return null;
        }

        PatientRestrictionEntity patientRestrictionEntity = new PatientRestrictionEntity();

        return patientRestrictionEntity;
    }
}
