package app.patient.mapstruct;

import app.patient.dto.CreateReqDTO;
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
public class PatientReqMapStructImpl implements PatientReqMapStruct {

    @Override
    public List<PatientEntity> toEntityList(List<CreateReqDTO> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<PatientEntity> list = new ArrayList<PatientEntity>( dtos.size() );
        for ( CreateReqDTO createReqDTO : dtos ) {
            list.add( toEntity( createReqDTO ) );
        }

        return list;
    }

    @Override
    public PatientEntity toEntity(CreateReqDTO dto) {
        if ( dto == null ) {
            return null;
        }

        PatientEntity patientEntity = new PatientEntity();

        return patientEntity;
    }
}
